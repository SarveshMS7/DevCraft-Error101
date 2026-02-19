
import { useState, useEffect } from 'react';
import { getTeamWithMembers, TeamWithMembers } from '../services/teamService';

export function useTeamMembers(teamId: string) {
    const [team, setTeam] = useState<TeamWithMembers | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchMembers() {
            try {
                setLoading(true);
                const data = await getTeamWithMembers(teamId);
                setTeam(data);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch team members'));
            } finally {
                setLoading(false);
            }
        }

        if (teamId) {
            fetchMembers();
        }
    }, [teamId]);

    return { team, loading, error };
}
