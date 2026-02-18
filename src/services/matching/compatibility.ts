import { MatchUser, MatchProject, MatchScore, SCORE_WEIGHTS, getScoreLabel } from './types';
import {
    calculateSkillOverlap,
    calculateComplementaryScore,
    calculateAvailabilityScore,
    calculateTimezoneScore
} from './scoring';

/**
 * Main compatibility scoring function (deterministic heuristics).
 *
 * Architecture:
 * - Rule-based matching with weighted scoring
 * - Skill overlap (55%): direct skill match percentage
 * - Complementary skills (20%): adjacent/related skill bonus
 * - Availability (15%): time commitment compatibility
 * - Timezone (10%): geographic overlap
 *
 * TODO Hooks for future enhancements:
 * 1. AI Embeddings: Replace calculateComplementaryScore with cosine similarity
 *    of skill embedding vectors (e.g., OpenAI text-embedding-ada-002)
 * 2. Graph-based matching: Build a skill graph where edges represent
 *    relationships (e.g., React -> TypeScript -> JavaScript) and use
 *    graph traversal to find deeper compatibility
 * 3. Collaborative filtering: Use past successful team compositions
 *    to predict future compatibility
 */
export const calculateCompatibility = (user: MatchUser, project: MatchProject): MatchScore => {
    const { score: skillOverlap, missingSkills } = calculateSkillOverlap(
        user.skills,
        project.required_skills
    );

    const complementaryScore = calculateComplementaryScore(
        user.skills,
        project.required_skills
    );

    const availabilityScore = calculateAvailabilityScore(
        user.availability,
        project.availability_required
    );

    const timezoneScore = calculateTimezoneScore(
        user.timezone,
        project.timezone_preferred
    );

    // Weighted average
    const finalScore = Math.round(
        (skillOverlap * SCORE_WEIGHTS.skillOverlap) +
        (complementaryScore * SCORE_WEIGHTS.complementary) +
        (availabilityScore * SCORE_WEIGHTS.availability) +
        (timezoneScore * SCORE_WEIGHTS.timezone)
    );

    return {
        projectId: project.id,
        score: Math.min(100, Math.max(0, finalScore)),
        label: getScoreLabel(finalScore),
        details: {
            skillOverlap,
            complementaryScore,
            availabilityScore,
            timezoneScore,
            missingSkills
        }
    };
};

/**
 * Rank multiple projects for a user, sorted by compatibility score.
 */
export const rankProjectsForUser = (user: MatchUser, projects: MatchProject[]): MatchScore[] => {
    return projects
        .map(project => calculateCompatibility(user, project))
        .sort((a, b) => b.score - a.score);
};
