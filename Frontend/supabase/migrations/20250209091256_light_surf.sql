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
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT valid_doctor_sender FOREIGN KEY (sender_id) 
        REFERENCES doctors(ref_id) 
        ON DELETE CASCADE
        ON UPDATE CASCADE
        WHEN (sender_type = 'doctor'),
    CONSTRAINT valid_doctor_recipient FOREIGN KEY (recipient_id) 
        REFERENCES doctors(ref_id) 
        ON DELETE CASCADE
        ON UPDATE CASCADE
        WHEN (recipient_type = 'doctor'),
    CONSTRAINT valid_assistant_sender FOREIGN KEY (sender_id) 
        REFERENCES assistants(id) 
        ON DELETE CASCADE
        ON UPDATE CASCADE
        WHEN (sender_type = 'assistant'),
    CONSTRAINT valid_assistant_recipient FOREIGN KEY (recipient_id) 
        REFERENCES assistants(id) 
        ON DELETE CASCADE
        ON UPDATE CASCADE
        WHEN (recipient_type = 'assistant')
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

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for messages
CREATE POLICY "Users can read their own messages"
ON messages FOR SELECT
USING (
    (sender_id = current_user_id() AND sender_type = current_user_type()) OR
    (recipient_id = current_user_id() AND recipient_type = current_user_type())
);

CREATE POLICY "Users can insert their own messages"
ON messages FOR INSERT
WITH CHECK (
    sender_id = current_user_id() AND 
    sender_type = current_user_type()
);

CREATE POLICY "Users can update their own messages"
ON messages FOR UPDATE
USING (
    sender_id = current_user_id() AND 
    sender_type = current_user_type()
);
// Add after line 74 (the update policy)
CREATE POLICY "Users can delete messages"
ON messages FOR DELETE
USING (
    sender_id = current_user_id()
    AND created_at > (NOW() - INTERVAL '24 HOURS')
);
-- Create storage bucket for chat attachments if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Chat attachments are publicly accessible" ON storage.objects;
    DROP POLICY IF EXISTS "Anyone can upload chat attachments" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update their own chat attachments" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete their own chat attachments" ON storage.objects;

    -- Create new policies
    CREATE POLICY "Chat attachments are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'chat-attachments');

    CREATE POLICY "Anyone can upload chat attachments"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'chat-attachments');

    CREATE POLICY "Users can update their own chat attachments"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'chat-attachments')
    WITH CHECK (bucket_id = 'chat-attachments');

    CREATE POLICY "Users can delete their own chat attachments"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'chat-attachments');
END $$;

-- Create functions to get current user info
CREATE OR REPLACE FUNCTION current_user_id() 
RETURNS text 
LANGUAGE sql 
STABLE
AS $$
    SELECT COALESCE(
        (SELECT ref_id FROM doctors WHERE id = auth.uid()),
        (SELECT id FROM assistants WHERE id = auth.uid()),
        'ai-bot'
    );
$$;

CREATE OR REPLACE FUNCTION current_user_type() 
RETURNS text 
LANGUAGE sql 
STABLE
AS $$
    SELECT CASE 
        WHEN EXISTS (SELECT 1 FROM doctors WHERE id = auth.uid()) THEN 'doctor'
        WHEN EXISTS (SELECT 1 FROM assistants WHERE id = auth.uid()) THEN 'assistant'
        ELSE 'ai'
    END;
$$;

-- Grant necessary permissions
GRANT ALL ON TABLE messages TO authenticated;
GRANT ALL ON TABLE messages TO anon;