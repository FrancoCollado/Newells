-- Create conversations table
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    professional_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Null if it's a general/area chat
    area TEXT, -- e.g., 'medica', 'tecnica', 'psicologia'
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('PLAYER', 'PROFESSIONAL')),
    sender_id UUID NOT NULL, -- Can be player.id or auth.users.id
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_conversations_player_id ON chat_conversations(player_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_last_message_at ON chat_conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- RLS Policies (Mainly for Professionals dashboard usage)
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (Professionals) to read/write
CREATE POLICY "Staff can view all conversations" ON chat_conversations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can insert conversations" ON chat_conversations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Staff can update conversations" ON chat_conversations FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Staff can view messages" ON chat_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can insert messages" ON chat_messages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Staff can update messages" ON chat_messages FOR UPDATE TO authenticated USING (true);

-- Add last_active_at to players for activity tracking
ALTER TABLE players ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;

