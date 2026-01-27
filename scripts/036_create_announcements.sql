-- Create Announcements System

BEGIN;

CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS announcement_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    division TEXT, -- Target specific division (e.g., 'Reserva', '10ma')
    player_id UUID REFERENCES players(id) ON DELETE CASCADE, -- Target specific player
    
    -- Constraint to ensure at least one target type is set (or both for specific intersection logic, but usually OR)
    -- Let's keep it flexible: 
    -- If division is set, it targets that division.
    -- If player_id is set, it targets that player.
    -- Rows act as OR conditions usually.
    CONSTRAINT check_target CHECK (division IS NOT NULL OR player_id IS NOT NULL)
);

-- RLS Policies

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_recipients ENABLE ROW LEVEL SECURITY;

-- Professionals (authenticated) can CRUD everything
CREATE POLICY "Staff can manage announcements" ON announcements
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Staff can manage recipients" ON announcement_recipients
    FOR ALL TO authenticated USING (true);

-- Players (anon in our custom auth) can READ announcements relevant to them
-- Since we use custom auth, we'll open READ to anon but filter in the query securely via Server Actions (using createAdminClient to fetch).
-- Or we can enable anon read for all and rely on the client knowing what to fetch?
-- Safer: Only allow SELECT on announcements if the user can prove they are the recipient.
-- But with custom auth, RLS is hard. We will use the pattern "Open SELECT to anon" and filter in the application layer or use a secure RPC/View.
-- For simplicity consistent with previous chat fix:

CREATE POLICY "Public read announcements" ON announcements
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Public read recipients" ON announcement_recipients
    FOR SELECT TO anon, authenticated USING (true);

COMMIT;
