/**
 * Utility functions for calculating specific scores
 */

export const calculateSkillOverlap = (userSkills: string[], requiredSkills: string[]) => {
    if (!requiredSkills || requiredSkills.length === 0) {
        return { score: 100, missingSkills: [] };
    }

    const userSkillsSet = new Set(userSkills.map(s => s.toLowerCase()));
    const requiredSkillsLower = requiredSkills.map(s => s.toLowerCase());

    let matchCount = 0;
    const missingSkills: string[] = [];

    requiredSkillsLower.forEach(skill => {
        if (userSkillsSet.has(skill)) {
            matchCount++;
        } else {
            missingSkills.push(skill);
        }
    });

    const score = Math.round((matchCount / requiredSkillsLower.length) * 100);
    return { score, missingSkills };
};

export const calculateComplementaryScore = (userSkills: string[], requiredSkills: string[]): number => {
    // Placeholder for complementary skill scoring
    // E.g., if project needs React and user knows Redux/React Query
    // For now, return a neutral score or basic heuristic
    return 50;
};

export const calculateAvailabilityScore = (userAvailability?: string, projectAvailability?: string): number => {
    if (!projectAvailability || !userAvailability) return 100;

    // Simple check for now, can be expanded to check hours/week or timezones
    return userAvailability.toLowerCase() === projectAvailability.toLowerCase() ? 100 : 50;
};
