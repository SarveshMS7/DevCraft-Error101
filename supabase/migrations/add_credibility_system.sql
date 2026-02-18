-- ============================================================
-- MIGRATION: Credibility Scoring System
-- Creates: skill_verifications, endorsements, activity_log,
--          user_credibility_cache
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. Skill Verifications ──────────────────────────────────
-- Tracks verified skills (tests passed, certifications, etc.)
CREATE TABLE IF NOT EXISTS skill_verifications (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  skill_name    text NOT NULL,
  verification_type text CHECK (verification_type IN (
    'self_declared', 'quiz_passed', 'peer_verified', 'project_proven', 'github_verified'
  )) DEFAULT 'self_declared',
  proficiency   text CHECK (proficiency IN (
    'beginner', 'intermediate', 'advanced', 'expert'
  )) DEFAULT 'intermediate',
  verified_at   timestamp with time zone DEFAULT timezone('utc'::text, now()),
  evidence_url  text,  -- optional link to proof (certificate, project, etc.)
  UNIQUE(user_id, skill_name, verification_type)
);

ALTER TABLE skill_verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Skill verifications are viewable by everyone" ON skill_verifications;
DROP POLICY IF EXISTS "Users can manage their own verifications" ON skill_verifications;

CREATE POLICY "Skill verifications are viewable by everyone" ON skill_verifications
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own verifications" ON skill_verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own verifications" ON skill_verifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_skill_verifications_user ON skill_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_verifications_skill ON skill_verifications(skill_name);


-- ── 2. Endorsements ─────────────────────────────────────────
-- Peer endorsements with anti-abuse protections
CREATE TABLE IF NOT EXISTS endorsements (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  endorser_id   uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  endorsed_id   uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  skill_name    text NOT NULL,
  project_id    uuid REFERENCES projects(id) ON DELETE SET NULL,  -- optional: endorsement tied to a project
  message       text,
  created_at    timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  -- Prevent self-endorsement and duplicate endorsements
  CONSTRAINT no_self_endorsement CHECK (endorser_id != endorsed_id),
  UNIQUE(endorser_id, endorsed_id, skill_name)
);

ALTER TABLE endorsements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Endorsements are viewable by everyone" ON endorsements;
DROP POLICY IF EXISTS "Authenticated users can create endorsements" ON endorsements;

CREATE POLICY "Endorsements are viewable by everyone" ON endorsements
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create endorsements" ON endorsements
  FOR INSERT WITH CHECK (
    auth.uid() = endorser_id AND
    auth.uid() != endorsed_id  -- enforced at policy level too
  );

CREATE INDEX IF NOT EXISTS idx_endorsements_endorsed ON endorsements(endorsed_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_endorser ON endorsements(endorser_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_skill ON endorsements(skill_name);


-- ── 3. Activity Log ─────────────────────────────────────────
-- Tracks user actions for reliability and consistency scoring
CREATE TABLE IF NOT EXISTS activity_log (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  action_type text CHECK (action_type IN (
    'project_created', 'project_completed', 'project_joined',
    'project_left', 'project_abandoned',
    'invite_sent', 'invite_accepted', 'invite_rejected', 'invite_received',
    'message_sent', 'join_request_sent', 'profile_updated',
    'endorsement_given', 'endorsement_received',
    'skill_added', 'skill_verified'
  )) NOT NULL,
  project_id  uuid REFERENCES projects(id) ON DELETE SET NULL,
  metadata    jsonb DEFAULT '{}',  -- flexible payload for extra data
  created_at  timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own activity" ON activity_log;
DROP POLICY IF EXISTS "Activity is insertable by system" ON activity_log;

-- Users can read their own activity, project owners can see project activity
CREATE POLICY "Users can view their own activity" ON activity_log
  FOR SELECT USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own activity
CREATE POLICY "Activity is insertable by authenticated users" ON activity_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_type ON activity_log(action_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_type ON activity_log(user_id, action_type);


-- ── 4. User Credibility Cache ───────────────────────────────
-- Caches the computed credibility score to avoid recalculating on every request
CREATE TABLE IF NOT EXISTS user_credibility_cache (
  user_id               uuid REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  credibility_score     real NOT NULL DEFAULT 0,      -- 0-100 raw weighted score
  confidence_multiplier real NOT NULL DEFAULT 0,      -- 0-1 data confidence
  final_rank_score      real NOT NULL DEFAULT 0,      -- credibility × confidence
  -- Pillar breakdowns
  skill_evidence_score  real NOT NULL DEFAULT 0,
  execution_proof_score real NOT NULL DEFAULT 0,
  social_validation_score real NOT NULL DEFAULT 0,
  reliability_score     real NOT NULL DEFAULT 0,
  consistency_score     real NOT NULL DEFAULT 0,
  -- Meta
  data_points_count     integer NOT NULL DEFAULT 0,   -- total signals used
  last_computed         timestamp with time zone DEFAULT timezone('utc'::text, now()),
  expires_at            timestamp with time zone DEFAULT (timezone('utc'::text, now()) + interval '1 hour')
);

ALTER TABLE user_credibility_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Credibility cache is viewable by everyone" ON user_credibility_cache;
DROP POLICY IF EXISTS "Users can upsert their own credibility cache" ON user_credibility_cache;

CREATE POLICY "Credibility cache is viewable by everyone" ON user_credibility_cache
  FOR SELECT USING (true);

-- Allow system/user to upsert their cache
CREATE POLICY "Users can upsert their own credibility cache" ON user_credibility_cache
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credibility cache" ON user_credibility_cache
  FOR UPDATE USING (auth.uid() = user_id);


-- ── 5. Add portfolio_url to profiles ────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'portfolio_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN portfolio_url text;
  END IF;
END $$;


-- ── 6. Enable Realtime for new tables ───────────────────────
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE endorsements;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;


-- ── 7. Reload schema cache ─────────────────────────────────
NOTIFY pgrst, 'reload schema';
