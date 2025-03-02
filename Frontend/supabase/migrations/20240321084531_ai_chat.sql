-- AI Chat Sessions
CREATE TABLE ai_chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id TEXT,
    title TEXT NOT NULL DEFAULT 'New Chat',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_doctor FOREIGN KEY (doctor_id) 
        REFERENCES doctors(ref_id) 
        ON DELETE SET NULL
);

-- AI Chat Messages
CREATE TABLE ai_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT NOT NULL CHECK (message_type IN ('text', 'image', 'pdf', 'file')),
    file_url TEXT,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('doctor', 'ai')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster querying
CREATE INDEX idx_ai_sessions_doctor ON ai_chat_sessions(doctor_id);
CREATE INDEX idx_ai_messages_session ON ai_chat_messages(session_id); 