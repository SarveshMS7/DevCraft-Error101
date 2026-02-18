-- ============================================================
-- FULL MIGRATION: Create all missing tables & columns
-- Run this ONCE in Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. Add missing columns to projects ──────────────────────
ALTER TABLE projects ADD COLUMN IF NOT EXISTS urgency    text    CHECK (urgency IN ('low', 'medium', 'high')) DEFAULT 'medium';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS team_size  integer DEFAULT 3;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS github_url text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS image_url  text;

-- ── 2. Create join_requests table (if not exists) ───────────
CREATE TABLE IF NOT EXISTS join_requests (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id    uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message    text,
  status     text CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  UNIQUE(project_id, user_id)
);

ALTER TABLE join_requests ENABLE ROW LEVEL SECURITY;

-- Drop policies first to avoid "already exists" errors on re-run
DROP POLICY IF EXISTS "Join requests viewable by owner and requester" ON join_requests;
DROP POLICY IF EXISTS "Authenticated users can create join requests."  ON join_requests;
DROP POLICY IF EXISTS "Project owners can update join requests."       ON join_requests;

CREATE POLICY "Join requests viewable by owner and requester" ON join_requests
  FOR SELECT USING (
    auth.uid() = user_id OR
    auth.uid() IN (SELECT owner_id FROM projects WHERE id = project_id)
  );

CREATE POLICY "Authenticated users can create join requests." ON join_requests
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Project owners can update join requests." ON join_requests
  FOR UPDATE USING (
    auth.uid() IN (SELECT owner_id FROM projects WHERE id = project_id)
  );

-- ── 3. Create messages table (if not exists) ────────────────
CREATE TABLE IF NOT EXISTS messages (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id    uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content    text NOT NULL
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop policies first to avoid "already exists" errors on re-run
DROP POLICY IF EXISTS "Messages viewable by project members" ON messages;
DROP POLICY IF EXISTS "Project members can insert messages." ON messages;

CREATE POLICY "Messages viewable by project members" ON messages
  FOR SELECT USING (
    auth.uid() IN (SELECT owner_id FROM projects WHERE id = project_id) OR
    auth.uid() IN (SELECT user_id FROM join_requests WHERE project_id = project_id AND status = 'accepted')
  );

CREATE POLICY "Project members can insert messages." ON messages
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT owner_id FROM projects WHERE id = project_id) OR
    auth.uid() IN (SELECT user_id FROM join_requests WHERE project_id = project_id AND status = 'accepted')
  );

-- ── 4. Enable Realtime on new tables ────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE join_requests;

-- ── 5. Reload schema cache ───────────────────────────────────
NOTIFY pgrst, 'reload schema';
