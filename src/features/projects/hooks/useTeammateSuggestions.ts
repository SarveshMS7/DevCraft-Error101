/**
 * useTeammateSuggestions Hook
 *
 * Fetches and caches teammate suggestions for a given project.
 * Lazy-loads suggestions and memoizes results per project.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getSuggestedTeammates, SuggestedTeammate } from '@/services/suggestions/service';

interface UseTeammateSuggestionsReturn {
    suggestions: SuggestedTeammate[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

// In-memory cache per project
const suggestionsCache = new Map<string, { data: SuggestedTeammate[]; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function useTeammateSuggestions(projectId: string | undefined): UseTeammateSuggestionsReturn {
    const [suggestions, setSuggestions] = useState<SuggestedTeammate[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fetchedRef = useRef<string | null>(null);

    const fetchSuggestions = useCallback(async () => {
        if (!projectId) return;

        // Check in-memory cache
        const cached = suggestionsCache.get(projectId);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
            setSuggestions(cached.data);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await getSuggestedTeammates(projectId);
            setSuggestions(data);

            // Cache the results
            suggestionsCache.set(projectId, {
                data,
                timestamp: Date.now(),
            });
        } catch (err: any) {
            const message = err?.message || 'Failed to load suggestions';
            setError(message);
            console.error('Error fetching suggestions:', err);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    // Lazy-load when project changes
    useEffect(() => {
        if (projectId && fetchedRef.current !== projectId) {
            fetchedRef.current = projectId;
            fetchSuggestions();
        }
    }, [projectId, fetchSuggestions]);

    const refresh = useCallback(async () => {
        if (projectId) {
            // Clear cache for this project
            suggestionsCache.delete(projectId);
            fetchedRef.current = null;
            await fetchSuggestions();
        }
    }, [projectId, fetchSuggestions]);

    return { suggestions, loading, error, refresh };
}
