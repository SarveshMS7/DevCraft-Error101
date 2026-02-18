-- ============================================================
-- DUMMY TEST DATA: Credibility Scoring System
-- Paste this into Supabase Dashboard → SQL Editor → Run
--
-- This script auto-detects your existing users and projects,
-- so it works on any environment without manual ID replacement.
-- ============================================================

-- ── Step 1: Pick real user/project IDs from your database ───
DO $$
DECLARE
    user1_id uuid;
    user2_id uuid;
    user3_id uuid;
    user4_id uuid;
    project1_id uuid;
    project2_id uuid;
BEGIN
    -- Get up to 4 user IDs
    SELECT id INTO user1_id FROM profiles ORDER BY updated_at DESC NULLS LAST LIMIT 1;
    SELECT id INTO user2_id FROM profiles WHERE id != user1_id ORDER BY updated_at DESC NULLS LAST LIMIT 1;
    SELECT id INTO user3_id FROM profiles WHERE id NOT IN (user1_id, user2_id) ORDER BY updated_at DESC NULLS LAST LIMIT 1;
    SELECT id INTO user4_id FROM profiles WHERE id NOT IN (user1_id, user2_id, user3_id) ORDER BY updated_at DESC NULLS LAST LIMIT 1;

    -- Get up to 2 project IDs
    SELECT id INTO project1_id FROM projects ORDER BY created_at DESC LIMIT 1;
    SELECT id INTO project2_id FROM projects WHERE id != project1_id ORDER BY created_at DESC LIMIT 1;

    -- Safety: need at least 2 users
    IF user1_id IS NULL OR user2_id IS NULL THEN
        RAISE NOTICE 'Need at least 2 users in profiles table. Aborting.';
        RETURN;
    END IF;

    RAISE NOTICE 'Using users: %, %, %, %', user1_id, user2_id, user3_id, user4_id;
    RAISE NOTICE 'Using projects: %, %', project1_id, project2_id;


    -- ── Step 2: Skill Verifications ─────────────────────────

    -- User 1: Expert-level verified skills (will score highest)
    INSERT INTO skill_verifications (user_id, skill_name, verification_type, proficiency)
    VALUES
        (user1_id, 'React', 'project_proven', 'expert'),
        (user1_id, 'TypeScript', 'github_verified', 'advanced'),
        (user1_id, 'Node.js', 'quiz_passed', 'advanced'),
        (user1_id, 'PostgreSQL', 'peer_verified', 'intermediate'),
        (user1_id, 'Tailwind CSS', 'project_proven', 'advanced')
    ON CONFLICT (user_id, skill_name, verification_type) DO NOTHING;

    -- User 2: Moderate skills
    INSERT INTO skill_verifications (user_id, skill_name, verification_type, proficiency)
    VALUES
        (user2_id, 'Python', 'github_verified', 'advanced'),
        (user2_id, 'Django', 'self_declared', 'intermediate'),
        (user2_id, 'JavaScript', 'quiz_passed', 'intermediate'),
        (user2_id, 'Docker', 'self_declared', 'beginner')
    ON CONFLICT (user_id, skill_name, verification_type) DO NOTHING;

    -- User 3: Beginner (if exists)
    IF user3_id IS NOT NULL THEN
        INSERT INTO skill_verifications (user_id, skill_name, verification_type, proficiency)
        VALUES
            (user3_id, 'HTML', 'self_declared', 'intermediate'),
            (user3_id, 'CSS', 'self_declared', 'beginner')
        ON CONFLICT (user_id, skill_name, verification_type) DO NOTHING;
    END IF;


    -- ── Step 3: Endorsements ────────────────────────────────

    -- User 2 endorses User 1 (strong signal)
    INSERT INTO endorsements (endorser_id, endorsed_id, skill_name, project_id)
    VALUES
        (user2_id, user1_id, 'React', project1_id),
        (user2_id, user1_id, 'TypeScript', project1_id)
    ON CONFLICT (endorser_id, endorsed_id, skill_name) DO NOTHING;

    -- User 1 endorses User 2
    INSERT INTO endorsements (endorser_id, endorsed_id, skill_name, project_id)
    VALUES
        (user1_id, user2_id, 'Python', project1_id)
    ON CONFLICT (endorser_id, endorsed_id, skill_name) DO NOTHING;

    -- Cross-endorsements with user3 and user4 (if they exist)
    IF user3_id IS NOT NULL THEN
        INSERT INTO endorsements (endorser_id, endorsed_id, skill_name)
        VALUES
            (user3_id, user1_id, 'Node.js'),
            (user1_id, user3_id, 'HTML')
        ON CONFLICT (endorser_id, endorsed_id, skill_name) DO NOTHING;
    END IF;

    IF user4_id IS NOT NULL THEN
        INSERT INTO endorsements (endorser_id, endorsed_id, skill_name)
        VALUES
            (user4_id, user1_id, 'React'),
            (user4_id, user2_id, 'Python')
        ON CONFLICT (endorser_id, endorsed_id, skill_name) DO NOTHING;
    END IF;


    -- ── Step 4: Activity Log ────────────────────────────────

    -- User 1: Very active over multiple months (high consistency)
    INSERT INTO activity_log (user_id, action_type, project_id, created_at) VALUES
        (user1_id, 'project_created', project1_id, NOW() - INTERVAL '90 days'),
        (user1_id, 'message_sent', project1_id, NOW() - INTERVAL '85 days'),
        (user1_id, 'skill_added', NULL, NOW() - INTERVAL '80 days'),
        (user1_id, 'endorsement_given', NULL, NOW() - INTERVAL '70 days'),
        (user1_id, 'project_completed', project1_id, NOW() - INTERVAL '60 days'),
        (user1_id, 'project_created', project2_id, NOW() - INTERVAL '50 days'),
        (user1_id, 'message_sent', project2_id, NOW() - INTERVAL '45 days'),
        (user1_id, 'invite_sent', project2_id, NOW() - INTERVAL '40 days'),
        (user1_id, 'message_sent', project2_id, NOW() - INTERVAL '30 days'),
        (user1_id, 'endorsement_given', NULL, NOW() - INTERVAL '20 days'),
        (user1_id, 'project_completed', project2_id, NOW() - INTERVAL '10 days'),
        (user1_id, 'profile_updated', NULL, NOW() - INTERVAL '2 days'),
        (user1_id, 'message_sent', NULL, NOW() - INTERVAL '1 day');

    -- User 2: Moderate activity
    INSERT INTO activity_log (user_id, action_type, project_id, created_at) VALUES
        (user2_id, 'project_joined', project1_id, NOW() - INTERVAL '80 days'),
        (user2_id, 'message_sent', project1_id, NOW() - INTERVAL '75 days'),
        (user2_id, 'skill_added', NULL, NOW() - INTERVAL '60 days'),
        (user2_id, 'invite_accepted', project1_id, NOW() - INTERVAL '50 days'),
        (user2_id, 'message_sent', project1_id, NOW() - INTERVAL '30 days'),
        (user2_id, 'endorsement_given', NULL, NOW() - INTERVAL '15 days'),
        (user2_id, 'profile_updated', NULL, NOW() - INTERVAL '5 days');

    -- User 3: Sparse activity (low consistency - should score lower)
    IF user3_id IS NOT NULL THEN
        INSERT INTO activity_log (user_id, action_type, created_at) VALUES
            (user3_id, 'profile_updated', NOW() - INTERVAL '30 days'),
            (user3_id, 'skill_added', NOW() - INTERVAL '28 days');
    END IF;


    -- ── Step 5: Project Members ─────────────────────────────

    -- Add users as project members (for execution proof)
    IF project1_id IS NOT NULL THEN
        INSERT INTO project_members (project_id, user_id, role)
        VALUES
            (project1_id, user1_id, 'leader'),
            (project1_id, user2_id, 'member')
        ON CONFLICT (project_id, user_id) DO NOTHING;
    END IF;

    IF project2_id IS NOT NULL THEN
        INSERT INTO project_members (project_id, user_id, role)
        VALUES (project2_id, user1_id, 'leader')
        ON CONFLICT (project_id, user_id) DO NOTHING;

        IF user3_id IS NOT NULL THEN
            INSERT INTO project_members (project_id, user_id, role)
            VALUES (project2_id, user3_id, 'member')
            ON CONFLICT (project_id, user_id) DO NOTHING;
        END IF;
    END IF;


    RAISE NOTICE '✅ Dummy data inserted successfully!';
    RAISE NOTICE 'User 1 (%): Expert — should score HIGHEST', user1_id;
    RAISE NOTICE 'User 2 (%): Moderate — should score MEDIUM', user2_id;
    IF user3_id IS NOT NULL THEN
        RAISE NOTICE 'User 3 (%): Beginner — should score LOW', user3_id;
    END IF;
    IF user4_id IS NOT NULL THEN
        RAISE NOTICE 'User 4 (%): Endorser only — minimal score', user4_id;
    END IF;

END $$;


-- ── Verify: Check what was inserted ─────────────────────────
SELECT 'skill_verifications' AS table_name, COUNT(*) AS rows FROM skill_verifications
UNION ALL
SELECT 'endorsements', COUNT(*) FROM endorsements
UNION ALL
SELECT 'activity_log', COUNT(*) FROM activity_log
UNION ALL
SELECT 'project_members', COUNT(*) FROM project_members;
