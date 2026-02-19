/**
 * ═══════════════════════════════════════════════════════════════
 * EXPLORE TEAMS — Service Layer
 * ═══════════════════════════════════════════════════════════════
 *
 * Clean service for fetching teams with:
 *   - Selective columns (no SELECT *)
 *   - Join-based member counts
 *   - Pagination
 *   - Client-side personalization scoring
 *
 * Reuses the existing supabase client from @/lib/supabase
 */

import { supabase } from '@/lib/supabase';
import { calculateCompatibility } from '@/services/matching/compatibility';
import type { ExploreTeam, ExploreTeamsFilters, SortOption } from '@/features/explore-teams/types';

// ─── Types for query results ─────────────────────────────────

interface ProjectRow {
    id: string;
    title: string;
    description: string;
    owner_id: string;
    created_at: string;
    required_skills: string[] | null;
    status: 'open' | 'in_progress' | 'completed' | null;
    urgency: 'low' | 'medium' | 'high' | null;
    team_size: number | null;
    profiles: { full_name: string | null; avatar_url: string | null } | null;
}

// ─── Public API ──────────────────────────────────────────────

/**
 * Fetch teams/projects for the Explore page.
 * Includes member counts and owner info in a single logical fetch.
 */
export async function getExploreTeams(
    filters: ExploreTeamsFilters,
    page: number,
    pageSize: number
): Promise<{ teams: ExploreTeam[]; total: number }> {
    // 1) Build the base query with selective columns
    let query = supabase
        .from('projects')
        .select(
            'id, title, description, owner_id, created_at, required_skills, status, urgency, team_size, profiles(full_name, avatar_url)',
            { count: 'exact' }
        );

    // 2) Apply status filter
    if (filters.status !== 'All') {
        query = query.eq('status', filters.status);
    }

    // 3) Apply search (title or description via ilike)
    if (filters.search.trim()) {
        const term = `%${filters.search.trim()}%`;
        query = query.or(`title.ilike.${term},description.ilike.${term}`);
    }

    // 4) Apply skill filter (require all selected skills via contains)
    if (filters.skills.length > 0) {
        query = query.contains('required_skills', filters.skills);
    }

    // 5) Apply team_size range
    if (filters.teamSizeMin !== undefined) {
        query = query.gte('team_size', filters.teamSizeMin);
    }
    if (filters.teamSizeMax !== undefined) {
        query = query.lte('team_size', filters.teamSizeMax);
    }

    // 6) Apply sorting
    const orderMap: Record<SortOption, { column: string; ascending: boolean }> = {
        recent: { column: 'created_at', ascending: false },
        most_active: { column: 'created_at', ascending: false }, // fallback, re-sorted client-side
        open_roles: { column: 'team_size', ascending: false },
        best_match: { column: 'created_at', ascending: false }, // re-sorted client-side
        team_size_asc: { column: 'team_size', ascending: true },
        team_size_desc: { column: 'team_size', ascending: false },
    };

    const order = orderMap[filters.sort] || orderMap.recent;
    query = query.order(order.column, { ascending: order.ascending });

    // 7) Pagination
    const from = page * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    const projects = (data || []) as unknown as ProjectRow[];

    // 8) Fetch member counts for all returned projects in a single query
    const projectIds = projects.map((p) => p.id);
    const memberCounts = await getMemberCounts(projectIds);

    // 9) Map to ExploreTeam shape
    const teams: ExploreTeam[] = projects.map((p) => {
        const memberCount = memberCounts.get(p.id) || 0;
        const teamCapacity = p.team_size || 4;
        const openRoles = Math.max(0, teamCapacity - memberCount);

        return {
            id: p.id,
            title: p.title,
            description: p.description,
            owner_id: p.owner_id,
            created_at: p.created_at,
            required_skills: p.required_skills || [],
            status: p.status,
            urgency: p.urgency,
            team_size: p.team_size,
            owner: p.profiles || undefined,
            member_count: memberCount,
            open_roles: openRoles,
            activity_score: computeActivityScore(p),
        };
    });

    // 10) Domain filter (client-side heuristic based on skills/description)
    let filtered = teams;
    if (filters.domain !== 'All') {
        filtered = teams.filter((t) => matchesDomain(t, filters.domain));
    }

    return { teams: filtered, total: count || 0 };
}

/**
 * Fetch teams with personalized matching for a logged-in user.
 * Wraps getExploreTeams and enriches with match scores.
 */
export async function getPersonalizedTeams(
    userId: string,
    userSkills: string[],
    filters: ExploreTeamsFilters,
    page: number,
    pageSize: number
): Promise<{ teams: ExploreTeam[]; total: number }> {
    const result = await getExploreTeams(filters, page, pageSize);

    // Score each team for the user
    const scored = result.teams.map((team) => {
        const match = calculateCompatibility(
            { id: userId, skills: userSkills },
            { id: team.id, required_skills: team.required_skills }
        );
        return {
            ...team,
            match_score: match.score,
            match_label: match.label,
            matched_skills: userSkills.filter((s) =>
                team.required_skills.some(
                    (rs) => rs.toLowerCase() === s.toLowerCase()
                )
            ),
        };
    });

    // If sorting by best_match, re-sort
    if (filters.sort === 'best_match') {
        scored.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
    }

    return { teams: scored, total: result.total };
}

// ─── Internal Helpers ────────────────────────────────────────

/**
 * Fetch member counts for a batch of project IDs.
 * Single query avoids N+1.
 */
async function getMemberCounts(projectIds: string[]): Promise<Map<string, number>> {
    const map = new Map<string, number>();
    if (projectIds.length === 0) return map;

    const { data, error } = await supabase
        .from('project_members')
        .select('project_id')
        .in('project_id', projectIds);

    if (error || !data) return map;

    // Count occurrences of each project_id
    for (const row of data) {
        const pid = (row as any).project_id as string;
        map.set(pid, (map.get(pid) || 0) + 1);
    }

    return map;
}

/**
 * Compute a lightweight "activity score" 0-100.
 * Uses recency of creation + status as heuristic.
 * In production, this could be precomputed or use activity_log table.
 */
function computeActivityScore(project: ProjectRow): number {
    const now = Date.now();
    const created = new Date(project.created_at).getTime();
    const ageInDays = (now - created) / (1000 * 60 * 60 * 24);

    let score = 0;

    // Recency bonus (max 50 points, decays over 90 days)
    score += Math.max(0, 50 - (ageInDays / 90) * 50);

    // Status bonus
    if (project.status === 'in_progress') score += 35;
    else if (project.status === 'open') score += 25;
    else if (project.status === 'completed') score += 10;

    // Urgency bonus
    if (project.urgency === 'high') score += 15;
    else if (project.urgency === 'medium') score += 10;
    else score += 5;

    return Math.min(100, Math.round(score));
}

/**
 * Heuristic domain matching based on skills and description keywords.
 */
const DOMAIN_KEYWORDS: Record<string, string[]> = {
    'AI/ML': ['ai', 'ml', 'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'llm', 'gpt', 'neural', 'nlp', 'computer vision'],
    'Web': ['react', 'vue', 'angular', 'next.js', 'html', 'css', 'tailwind', 'web', 'frontend', 'backend', 'fullstack', 'node.js', 'django', 'flask', 'express'],
    'Mobile': ['react native', 'flutter', 'swift', 'kotlin', 'ios', 'android', 'mobile'],
    'Blockchain': ['blockchain', 'solidity', 'ethereum', 'web3', 'smart contract', 'defi', 'nft', 'crypto'],
    'IoT': ['iot', 'arduino', 'raspberry', 'embedded', 'sensor', 'mqtt'],
    'Data Science': ['data science', 'pandas', 'numpy', 'jupyter', 'analytics', 'visualization', 'tableau', 'power bi', 'statistics'],
    'DevOps': ['devops', 'docker', 'kubernetes', 'ci/cd', 'aws', 'gcp', 'azure', 'terraform', 'jenkins'],
    'Game Dev': ['unity', 'unreal', 'godot', 'game', 'opengl', 'vulkan', 'c++', 'gamedev'],
    'Cybersecurity': ['security', 'penetration', 'cybersecurity', 'encryption', 'firewall', 'vulnerability', 'ctf'],
};

function matchesDomain(team: ExploreTeam, domain: string): boolean {
    const keywords = DOMAIN_KEYWORDS[domain];
    if (!keywords) return true;

    const searchText = [
        ...team.required_skills,
        team.title,
        team.description,
    ].join(' ').toLowerCase();

    return keywords.some((kw) => searchText.includes(kw));
}
