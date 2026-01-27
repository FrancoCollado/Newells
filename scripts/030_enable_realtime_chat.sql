-- Enable Realtime for chat tables
-- Check if publication exists first to avoid errors, though usually 'supabase_realtime' exists by default.
-- We add the tables to the publication so clients can listen to changes.

BEGIN;
  -- Add tables to the publication if they are not already there
  -- This syntax works for PostgreSQL 15+ if the table isn't already in. 
  -- For older versions or safety, we often just run it and let it fail if duplicate or check.
  -- Simpler approach: Alter publication adds table.
  
  ALTER PUBLICATION supabase_realtime ADD TABLE chat_conversations;
  ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
COMMIT;
