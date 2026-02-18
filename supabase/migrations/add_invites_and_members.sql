-- ============================================================
-- MIGRATION: Teammate Suggestion & Invite System
-- Creates: project_invites, project_members, github_profiles
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. GitHub Profiles Cache ─────────────────────────────────
CREATE TABLE IF NOT EXISTS github_profiles (
  user_id      uuid REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  username     text NOT NULL,
  languages    jsonb DEFAULT '{}',
  topics       jsonb DEFAULT '[]',
  repo_names   jsonb DEFAULT '[]',
  last_fetched timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE github_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "GitHub profiles are viewable by everyone" ON github_profiles;
DROP POLICY IF EXISTS "Users can insert their own github profile" ON github_profiles;
DROP POLICY IF EXISTS "Users can update their own github profile" ON github_profiles;

CREATE POLICY "GitHub profiles are viewable by everyone" ON github_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own github profile" ON github_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own github profile" ON github_profiles
  FOR UPDATE USING (auth.uid() = user_id);


-- ── 2. Project Invites ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_invites (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id  uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  sender_id   uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message     text,
  status      text CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at  timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(project_id, receiver_id)
);

ALTER TABLE project_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Invites readable by sender and receiver" ON project_invites;
DROP POLICY IF EXISTS "Only project owners can send invites" ON project_invites;
DROP POLICY IF EXISTS "Only receivers can update invite status" ON project_invites;

-- Sender and receiver can read invites
CREATE POLICY "Invites readable by sender and receiver" ON project_invites
  FOR SELECT USING (
    auth.uid() = sender_id OR
    auth.uid() = receiver_id
  );

-- Only project owners can send invites
CREATE POLICY "Only project owners can send invites" ON project_invites
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    auth.uid() IN (SELECT owner_id FROM projects WHERE id = project_id)
  );

-- Only receivers can update invite status
CREATE POLICY "Only receivers can update invite status" ON project_invites
  FOR UPDATE USING (
    auth.uid() = receiver_id
  );

CREATE INDEX IF NOT EXISTS idx_project_invites_receiver ON project_invites(receiver_id);
CREATE INDEX IF NOT EXISTS idx_project_invites_project ON project_invites(project_id);
CREATE INDEX IF NOT EXISTS idx_project_invites_status ON project_invites(status);


-- ── 3. Project Members ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_members (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id    uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role       text CHECK (role IN ('leader', 'member')) DEFAULT 'member',
  joined_at  timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(project_id, user_id)
);

ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Project members are readable by all authenticated users" ON project_members;
DROP POLICY IF EXISTS "Project owners can insert members" ON project_members;
DROP POLICY IF EXISTS "Members can insert themselves via acceptance" ON project_members;

-- All authenticated users can read project members
CREATE POLICY "Project members are readable by all authenticated users" ON project_members
  FOR SELECT USING (auth.role() = 'authenticated');

-- Project owners can insert new members
CREATE POLICY "Project owners can insert members" ON project_members
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT owner_id FROM projects WHERE id = project_id)
    OR
    -- Allow self-insertion when accepting an invite
    (auth.uid() = user_id AND EXISTS (
      SELECT 1 FROM project_invites
      WHERE project_invites.project_id = project_members.project_id
        AND project_invites.receiver_id = auth.uid()
        AND project_invites.status = 'accepted'
    ))
  );

CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);


-- ── 4. Enable Realtime ──────────────────────────────────────
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE project_invites;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE project_members;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;


-- ── 5. Reload schema cache ──────────────────────────────────
NOTIFY pgrst, 'reload schema';
