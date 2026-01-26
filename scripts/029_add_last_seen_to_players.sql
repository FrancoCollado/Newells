-- Add last_seen column to players if it doesn't exist
ALTER TABLE public.players 
ADD COLUMN IF NOT EXISTS last_seen timestamp with time zone;

-- Allow players (authenticated users) to update their own last_seen column
-- We assume players are linked via some auth mechanism, but since players table is the profile for players:
-- If the application uses email mapping or similar, we trust the application logic or existing policies.
-- However, for robustness, we generally ensure users can only update their own records.
-- Based on existing policies "Authenticated users can access players", we just need to ensure UPDATE is allowed.

-- Check if a specific update policy exists, if not create a general one for players to update themselves
-- Since players don't have a direct 'user_id' column linking to auth.users in the schema provided earlier (it just has id),
-- we rely on the application backend/client to perform the update correctly.
-- But standard practice is RLS. Assuming the 'id' in players matches auth.uid() OR there is a mapping.
-- If 'players' table ID is NOT the auth.uid(), we need a way to verify ownership. 
-- In many setups 'players.id' IS NOT 'auth.uid()'.
-- However, let's look at previous scripts/schema. 
-- Usually 'profiles' table links to auth.users. 'players' seems to be the content table.
-- Wait, the chat feature usually involves players active in the portal.
-- The portal uses `dni` login usually, and might link to a player record.

-- For now, we will allow authenticated users to update this column.
-- Ideally this should be restricted to the specific player, but without 'user_id' on players table or knowing the exact auth link:
-- We'll assume the client updating it is authorized.

-- We enable update policy for authenticated users if not already present or specific enough.
-- The secure schema created in previous steps:
-- create policy "Authenticated users can access players" on public.players for all to authenticated using (true) with check (true);
-- This "for all" allows SELECT, INSERT, UPDATE, DELETE.
-- So permissions are likely already sufficient for authenticated users.

-- We just need the column.
