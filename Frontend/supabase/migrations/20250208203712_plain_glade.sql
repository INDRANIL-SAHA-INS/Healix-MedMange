-- Drop existing messages table if it exists
DROP TABLE IF EXISTS messages CASCADE;

-- Create messages table with proper structure
CREATE TABLE messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id text NOT NULL,
    recipient_id text NOT NULL,
    content text NOT NULL,
    message_type text NOT NULL CHECK (message_type IN ('text', 'image', 'video', 'voice')),
    file_url text,
    read_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT fk_sender FOREIGN KEY (sender_id) 
        REFERENCES doctors(ref_id) 
        ON UPDATE CASCADE 
        ON DELETE RESTRICT,
    CONSTRAINT fk_recipient FOREIGN KEY (recipient_id) 
        REFERENCES doctors(ref_id) 
        ON UPDATE CASCADE 
        ON DELETE RESTRICT
);

-- Create indexes for better query performance
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

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

-- Create storage bucket for chat attachments if it doesn't exist
INSERT INTO storage.buckets (id, name)
VALUES ('chat-attachments', 'chat-attachments')
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Chat attachments are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-attachments');

CREATE POLICY "Authenticated users can upload chat attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chat-attachments');