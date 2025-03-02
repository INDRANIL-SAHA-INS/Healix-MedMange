-- Add new columns and constraints to messages table if they don't exist
DO $$ 
BEGIN
    -- Add sender_type if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'sender_type'
    ) THEN
        ALTER TABLE messages ADD COLUMN sender_type text;
        ALTER TABLE messages ADD CONSTRAINT check_sender_type CHECK (sender_type IN ('doctor', 'assistant'));
    END IF;

    -- Add recipient_type if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'recipient_type'
    ) THEN
        ALTER TABLE messages ADD COLUMN recipient_type text;
        ALTER TABLE messages ADD CONSTRAINT check_recipient_type CHECK (recipient_type IN ('doctor', 'assistant'));
    END IF;

    -- Add message_type if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'message_type'
    ) THEN
        ALTER TABLE messages ADD COLUMN message_type text;
        ALTER TABLE messages ADD CONSTRAINT check_message_type CHECK (message_type IN ('text', 'image', 'video', 'voice'));
    END IF;

    -- Add file_url if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'file_url'
    ) THEN
        ALTER TABLE messages ADD COLUMN file_url text;
    END IF;

    -- Add read_at if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'read_at'
    ) THEN
        ALTER TABLE messages ADD COLUMN read_at timestamptz;
    END IF;

    -- Add deleted_at if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'deleted_at'
    ) THEN
        ALTER TABLE messages ADD COLUMN deleted_at timestamptz;
    END IF;
END $$;

-- Create indexes if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'idx_messages_sender'
    ) THEN
        CREATE INDEX idx_messages_sender ON messages(sender_id, sender_type);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'idx_messages_recipient'
    ) THEN
        CREATE INDEX idx_messages_recipient ON messages(recipient_id, recipient_type);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'idx_messages_created_at'
    ) THEN
        CREATE INDEX idx_messages_created_at ON messages(created_at);
    END IF;
END $$;

-- Grant permissions
GRANT ALL ON TABLE messages TO authenticated;
GRANT ALL ON TABLE messages TO anon;

-- Disable RLS for simplicity since we're using local storage
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;