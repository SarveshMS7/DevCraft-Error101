import { MatchUser, MatchProject, MatchScore } from './types';
import { calculateSkillOverlap, calculateComplementaryScore, calculateAvailabilityScore } from './scoring';

/**
 * Main compatibility scoring function (deterministic heuristics)
 * Designed to later plug in AI/Embeddings
 */
export const calculateCompatibility = (user: MatchUser, project: MatchProject): MatchScore => {
    const { score: skillOverlap, missingSkills } = calculateSkillOverlap(user.skills, project.required_skills);

    // TODO: Implement more complex complementary scoring
    const complementaryScore = calculateComplementaryScore(user.skills, project.required_skills);

    // TODO: Implement availability overlap scoring
    const availabilityScore = calculateAvailabilityScore(user.availability, project.availability_required);

    // Weighted average of scores
    // Skills: 60%, Complementary: 20%, Availability: 20%
    const finalScore = Math.round(
        (skillOverlap * 0.6) +
        (complementaryScore * 0.2) +
        (availabilityScore * 0.2)
    );

    // TODO Hooks for future enhancements:
    // 1. AI Embeddings based matching
    // 2. Graph-based skill relationship matching

    return {
        projectId: project.id,
        score: finalScore,
        details: {
            skillOverlap,
            complementaryScore,
            availabilityScore,
            missingSkills
        }
    };
};
