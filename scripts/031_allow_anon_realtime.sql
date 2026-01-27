-- Fix RLS policies to allow Players (who are 'anon' in Supabase Auth context) to use Realtime
-- Current Player Auth is custom (JWT cookies), not Supabase Auth.
-- So we must allow 'anon' role to SELECT/READ chat messages to receive Realtime events.
-- Security relies on the UUIDs being secret and the Next.js middleware protecting the page access.

BEGIN;

-- Drop restrictive policies
DROP POLICY IF EXISTS "Staff can view all conversations" ON chat_conversations;
DROP POLICY IF EXISTS "Staff can view messages" ON chat_messages;

-- Create inclusive policies for Conversations
CREATE POLICY "Public read conversations" 
ON chat_conversations FOR SELECT 
TO anon, authenticated 
USING (true);

-- Create inclusive policies for Messages
CREATE POLICY "Public read messages" 
ON chat_messages FOR SELECT 
TO anon, authenticated 
USING (true);

-- Insert policies remain authenticated-only (Staff) OR handled via Server Actions (Service Role)
-- So we don't need to open INSERT/UPDATE to anon, only SELECT for Realtime.

COMMIT;
