/**
 * Utility functions for calculating specific match scores.
 * All functions are deterministic (heuristic-based).
 * Designed to later plug in AI embeddings or graph-based matching.
 */

// Skill relationship map for complementary scoring
// Maps a skill to related/complementary skills
const SKILL_RELATIONSHIPS: Record<string, string[]> = {
    react: ['typescript', 'javascript', 'redux', 'react-query', 'nextjs', 'vite', 'tailwind', 'css'],
    vue: ['typescript', 'javascript', 'vuex', 'nuxt', 'css'],
    angular: ['typescript', 'javascript', 'rxjs', 'ngrx'],
    typescript: ['javascript', 'react', 'node', 'express', 'nestjs'],
    javascript: ['typescript', 'react', 'vue', 'angular', 'node', 'express'],
    python: ['django', 'fastapi', 'flask', 'ml', 'ai', 'tensorflow', 'pytorch', 'pandas', 'numpy'],
    'machine learning': ['python', 'tensorflow', 'pytorch', 'scikit-learn', 'data science', 'ai'],
    ai: ['python', 'machine learning', 'tensorflow', 'pytorch', 'nlp'],
    node: ['javascript', 'typescript', 'express', 'nestjs', 'mongodb'],
    express: ['node', 'javascript', 'typescript', 'mongodb', 'postgresql'],
    postgresql: ['sql', 'node', 'python', 'supabase', 'prisma'],
    mongodb: ['node', 'javascript', 'express', 'mongoose'],
    rust: ['systems programming', 'webassembly', 'c++'],
    go: ['microservices', 'docker', 'kubernetes', 'backend'],
    docker: ['kubernetes', 'devops', 'ci/cd', 'linux'],
    kubernetes: ['docker', 'devops', 'cloud', 'aws', 'gcp'],
    design: ['figma', 'ui/ux', 'css', 'tailwind', 'sketch'],
    figma: ['design', 'ui/ux', 'prototyping'],
};

/**
 * Calculate skill overlap score (0-100)
 * Returns percentage of required skills the user has
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

/**
 * Calculate complementary skill score (0-100)
 * Rewards users who have skills related to the required skills
 * even if they don't have an exact match.
 *
 * TODO: Replace with AI embedding similarity (e.g., cosine similarity of skill vectors)
 */
export const calculateComplementaryScore = (userSkills: string[], requiredSkills: string[]): number => {
    if (!requiredSkills || requiredSkills.length === 0) return 100;
    if (!userSkills || userSkills.length === 0) return 0;

    const userSkillsLower = new Set(userSkills.map(s => s.toLowerCase()));
    const requiredSkillsLower = requiredSkills.map(s => s.toLowerCase());

    let totalComplementaryScore = 0;

    requiredSkillsLower.forEach(requiredSkill => {
        // If user already has the skill, full score
        if (userSkillsLower.has(requiredSkill)) {
            totalComplementaryScore += 100;
            return;
        }

        // Check if user has complementary skills
        const relatedSkills = SKILL_RELATIONSHIPS[requiredSkill] || [];
        const matchingRelated = relatedSkills.filter(s => userSkillsLower.has(s));

        if (matchingRelated.length > 0) {
            // Partial credit for complementary skills (max 60%)
            const complementaryBonus = Math.min(60, matchingRelated.length * 20);
            totalComplementaryScore += complementaryBonus;
        }
    });

    return Math.round(totalComplementaryScore / requiredSkillsLower.length);
};

/**
 * Calculate availability overlap score (0-100)
 * TODO: Extend with timezone overlap scoring
 */
export const calculateAvailabilityScore = (userAvailability?: string, projectAvailability?: string): number => {
    if (!projectAvailability || !userAvailability) return 100; // No constraint = full score

    const availabilityRank: Record<string, number> = {
        'full-time': 4,
        'part-time': 3,
        'weekends': 2,
        'evenings': 1,
    };

    const userRank = availabilityRank[userAvailability.toLowerCase()] || 2;
    const projectRank = availabilityRank[projectAvailability.toLowerCase()] || 2;

    if (userRank >= projectRank) return 100;
    if (userRank === projectRank - 1) return 70;
    return 40;
};

/**
 * Calculate timezone compatibility score (0-100)
 * TODO: Implement full timezone overlap calculation
 */
export const calculateTimezoneScore = (userTimezone?: string, projectTimezone?: string): number => {
    if (!userTimezone || !projectTimezone) return 100;
    if (userTimezone === projectTimezone) return 100;

    // Parse UTC offset and calculate difference
    const parseOffset = (tz: string): number => {
        const match = tz.match(/UTC([+-])(\d+):(\d+)/);
        if (!match) return 0;
        const sign = match[1] === '+' ? 1 : -1;
        return sign * (parseInt(match[2]) + parseInt(match[3]) / 60);
    };

    const diff = Math.abs(parseOffset(userTimezone) - parseOffset(projectTimezone));
    if (diff <= 2) return 100;
    if (diff <= 5) return 75;
    if (diff <= 8) return 50;
    return 25;
};
