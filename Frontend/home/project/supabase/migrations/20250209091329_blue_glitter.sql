-- Drop existing messages table
DROP TABLE IF EXISTS messages CASCADE;

-- Create messages table with proper structure
CREATE TABLE messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id text NOT NULL,
    sender_type text NOT NULL CHECK (sender_type IN ('doctor', 'assistant', 'ai')),
    recipient_id text NOT NULL,
    recipient_type text NOT NULL CHECK (recipient_type IN ('doctor', 'assistant', 'ai')),
    content text NOT NULL,
    message_type text NOT NULL CHECK (message_type IN ('text', 'image', 'video', 'voice', 'pdf')),
    file_url text,
    read_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_messages_sender ON messages(sender_id, sender_type);
CREATE INDEX idx_messages_recipient ON messages(recipient_id, recipient_type);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_read_at ON messages(read_at);

-- Create trigger for updated_at timestamp
CREATE TRIGGER update_messages_timestamp
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Create function to check if a doctor exists
CREATE OR REPLACE FUNCTION check_doctor_exists(doctor_id text) 
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM doctors WHERE ref_id = doctor_id);
END;
$$ LANGUAGE plpgsql;

-- Create function to check if an assistant exists
CREATE OR REPLACE FUNCTION check_assistant_exists(assistant_id text) 
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM assistants WHERE id = assistant_id);
END;
$$ LANGUAGE plpgsql;

-- Add validation trigger
CREATE OR REPLACE FUNCTION validate_message_participants()
RETURNS TRIGGER AS $$
BEGIN
    -- Skip validation for AI bot
    IF NEW.sender_type = 'ai' OR NEW.recipient_type = 'ai' THEN
        RETURN NEW;
    END IF;

    -- Validate sender
    IF NEW.sender_type = 'doctor' AND NOT check_doctor_exists(NEW.sender_id) THEN
        RAISE EXCEPTION 'Invalid doctor sender_id';
    END IF;
    IF NEW.sender_type = 'assistant' AND NOT check_assistant_exists(NEW.sender_id) THEN
        RAISE EXCEPTION 'Invalid assistant sender_id';
    END IF;

    -- Validate recipient
    IF NEW.recipient_type = 'doctor' AND NOT check_doctor_exists(NEW.recipient_id) THEN
        RAISE EXCEPTION 'Invalid doctor recipient_id';
    END IF;
    IF NEW.recipient_type = 'assistant' AND NOT check_assistant_exists(NEW.recipient_id) THEN
        RAISE EXCEPTION 'Invalid assistant recipient_id';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_message_participants_trigger
    BEFORE INSERT OR UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION validate_message_participants();

-- Grant necessary permissions
GRANT ALL ON TABLE messages TO authenticated;
GRANT ALL ON TABLE messages TO anon;

-- Disable RLS for simplicity since we're using local storage
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;