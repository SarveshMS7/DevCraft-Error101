/**
 * ═══════════════════════════════════════════════════════════════
 * EXPLORE TEAMS — Type Definitions
 * ═══════════════════════════════════════════════════════════════
 * 
 * Types for the Explore Teams feature, bridging Supabase data
 * with the frontend discovery surface.
 */

// ─── Sort Options ────────────────────────────────────────────

export type SortOption =
    | 'recent'
    | 'most_active'
    | 'open_roles'
    | 'best_match'
    | 'team_size_asc'
    | 'team_size_desc';

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: 'recent', label: 'Recently Created' },
    { value: 'most_active', label: 'Most Active' },
    { value: 'open_roles', label: 'Open Roles First' },
    { value: 'best_match', label: 'Best Match' },
    { value: 'team_size_asc', label: 'Smallest Teams' },
    { value: 'team_size_desc', label: 'Largest Teams' },
];

// ─── Status / Domain Constants ───────────────────────────────

export const STATUS_OPTIONS = ['All', 'open', 'in_progress', 'completed'] as const;
export type StatusFilter = (typeof STATUS_OPTIONS)[number];

export const DOMAIN_OPTIONS = [
    'All',
    'AI/ML',
    'Web',
    'Mobile',
    'Blockchain',
    'IoT',
    'Data Science',
    'DevOps',
    'Game Dev',
    'Cybersecurity',
] as const;
export type DomainFilter = (typeof DOMAIN_OPTIONS)[number];

// ─── Filter Params ───────────────────────────────────────────

export interface ExploreTeamsFilters {
    search: string;
    skills: string[];
    status: StatusFilter;
    domain: DomainFilter;
    teamSizeMin?: number;
    teamSizeMax?: number;
    sort: SortOption;
}

export const DEFAULT_FILTERS: ExploreTeamsFilters = {
    search: '',
    skills: [],
    status: 'All',
    domain: 'All',
    sort: 'recent',
};

// ─── Team Data (from Supabase + computed) ────────────────────

export interface ExploreTeam {
    id: string;
    title: string;
    description: string;
    owner_id: string;
    created_at: string;
    required_skills: string[];
    status: 'open' | 'in_progress' | 'completed' | null;
    urgency: 'low' | 'medium' | 'high' | null;
    team_size: number | null;

    // Joined data
    owner?: {
        full_name: string | null;
        avatar_url: string | null;
    };

    // Computed metadata
    member_count: number;
    open_roles: number;
    activity_score: number;   // 0-100 based on recent activity

    // Personalization (optional, logged-in user)
    match_score?: number;     // 0-100 compatibility
    match_label?: 'Excellent' | 'Good' | 'Fair' | 'Low';
    matched_skills?: string[];
}

// ─── Pagination ──────────────────────────────────────────────

export interface PaginationState {
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
}

export const DEFAULT_PAGINATION: PaginationState = {
    page: 0,
    pageSize: 12,
    total: 0,
    hasMore: true,
};
