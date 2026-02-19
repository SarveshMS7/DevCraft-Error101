/**
 * Shared types for all matching engines.
 * Avoids duplication between project-user and teammate matching.
 */

/** Common label type for match quality */
export type MatchLabel = 'Excellent' | 'Good' | 'Fair' | 'Low';

/** Get a human-readable label from a 0-100 score */
export const getMatchLabel = (score: number): MatchLabel => {
    if (score >= 75) return 'Excellent';
    if (score >= 50) return 'Good';
    if (score >= 25) return 'Fair';
    return 'Low';
};
