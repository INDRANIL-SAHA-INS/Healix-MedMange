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

-- Grant necessary permissions
GRANT ALL ON TABLE messages TO authenticated;
GRANT ALL ON TABLE messages TO anon;

-- Disable RLS for simplicity since we're using local storage
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;