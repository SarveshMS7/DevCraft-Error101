/**
 * ═══════════════════════════════════════════════════════════════
 * useExploreTeams — Custom Hook
 * ═══════════════════════════════════════════════════════════════
 *
 * Manages state for the Explore Teams feature:
 *   - Fetching teams with filters/sort/pagination
 *   - Personalized matching for logged-in users
 *   - Debounced search
 *   - Loading states
 *
 * Reuses existing auth and profile hooks.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { useToast } from '@/components/ui/use-toast';
import { getExploreTeams, getPersonalizedTeams } from '@/features/explore-teams/services/exploreTeamsService';
import type {
    ExploreTeam,
    ExploreTeamsFilters,
    PaginationState,
    SortOption,
    StatusFilter,
    DomainFilter,
} from '@/features/explore-teams/types';
import {
    DEFAULT_FILTERS,
    DEFAULT_PAGINATION,
} from '@/features/explore-teams/types';

export function useExploreTeams() {
    const { user } = useAuth();
    const { profile } = useProfile();
    const { toast } = useToast();

    const [teams, setTeams] = useState<ExploreTeam[]>([]);
    const [filters, setFilters] = useState<ExploreTeamsFilters>(DEFAULT_FILTERS);
    const [pagination, setPagination] = useState<PaginationState>(DEFAULT_PAGINATION);
    const [loading, setLoading] = useState(true);
    const [initialLoad, setInitialLoad] = useState(true);

    // Debounce timer ref
    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ─── Core fetch ──────────────────────────────────────────

    const fetchTeams = useCallback(
        async (currentFilters: ExploreTeamsFilters, page: number, append = false) => {
            try {
                setLoading(true);

                let result: { teams: ExploreTeam[]; total: number };

                if (user && profile?.skills && profile.skills.length > 0) {
                    result = await getPersonalizedTeams(
                        user.id,
                        profile.skills,
                        currentFilters,
                        page,
                        pagination.pageSize
                    );
                } else {
                    result = await getExploreTeams(
                        currentFilters,
                        page,
                        pagination.pageSize
                    );
                }

                if (append) {
                    setTeams((prev) => [...prev, ...result.teams]);
                } else {
                    setTeams(result.teams);
                }

                setPagination((prev) => ({
                    ...prev,
                    page,
                    total: result.total,
                    hasMore: (page + 1) * prev.pageSize < result.total,
                }));
            } catch (error: any) {
                console.error('Error fetching explore teams:', error);
                toast({
                    title: 'Error loading teams',
                    description: error.message || 'Please try again later.',
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
                setInitialLoad(false);
            }
        },
        [user, profile, pagination.pageSize, toast]
    );

    // ─── Initial load ────────────────────────────────────────

    useEffect(() => {
        fetchTeams(filters, 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, profile]);

    // ─── Filter setters (reset pagination on filter change) ──

    const updateSearch = useCallback(
        (search: string) => {
            setFilters((prev) => {
                const next = { ...prev, search };
                // Debounce search
                if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
                searchTimerRef.current = setTimeout(() => {
                    fetchTeams(next, 0);
                }, 400);
                return next;
            });
        },
        [fetchTeams]
    );

    const updateSort = useCallback(
        (sort: SortOption) => {
            setFilters((prev) => {
                const next = { ...prev, sort };
                fetchTeams(next, 0);
                return next;
            });
        },
        [fetchTeams]
    );

    const updateStatus = useCallback(
        (status: StatusFilter) => {
            setFilters((prev) => {
                const next = { ...prev, status };
                fetchTeams(next, 0);
                return next;
            });
        },
        [fetchTeams]
    );

    const updateDomain = useCallback(
        (domain: DomainFilter) => {
            setFilters((prev) => {
                const next = { ...prev, domain };
                fetchTeams(next, 0);
                return next;
            });
        },
        [fetchTeams]
    );

    const toggleSkillFilter = useCallback(
        (skill: string) => {
            setFilters((prev) => {
                const skills = prev.skills.includes(skill)
                    ? prev.skills.filter((s) => s !== skill)
                    : [...prev.skills, skill];
                const next = { ...prev, skills };
                fetchTeams(next, 0);
                return next;
            });
        },
        [fetchTeams]
    );

    const clearFilters = useCallback(() => {
        setFilters(DEFAULT_FILTERS);
        fetchTeams(DEFAULT_FILTERS, 0);
    }, [fetchTeams]);

    // ─── Pagination ──────────────────────────────────────────

    const loadMore = useCallback(() => {
        if (!pagination.hasMore || loading) return;
        fetchTeams(filters, pagination.page + 1, true);
    }, [pagination, loading, filters, fetchTeams]);

    const refresh = useCallback(() => {
        fetchTeams(filters, 0);
    }, [filters, fetchTeams]);

    // ─── Computed ────────────────────────────────────────────

    const hasActiveFilters =
        filters.search !== '' ||
        filters.skills.length > 0 ||
        filters.status !== 'All' ||
        filters.domain !== 'All';

    return {
        teams,
        filters,
        pagination,
        loading,
        initialLoad,
        hasActiveFilters,

        // Actions
        updateSearch,
        updateSort,
        updateStatus,
        updateDomain,
        toggleSkillFilter,
        clearFilters,
        loadMore,
        refresh,
    };
}
