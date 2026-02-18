/** Result from the teammate matching engine */
export interface MatchResult {
    userId: string;
    score: number;            // 0-100 final weighted score
    matchedSkills: string[];  // skills that matched
    confidence: number;       // 0-1 confidence in the match
    label: 'Excellent' | 'Good' | 'Fair' | 'Low';
    details: TeammateMatchDetails;
}

/** Breakdown of match scoring components */
export interface TeammateMatchDetails {
    skillOverlapScore: number;       // 0-100
    githubLanguageScore: number;     // 0-100
    repoRelevanceScore: number;      // 0-100
    complementaryScore: number;      // 0-100
    missingSkills: string[];
}

/** Weights for teammate matching (total = 1.0) */
export const TEAMMATE_SCORE_WEIGHTS = {
    skillOverlap: 0.45,        // Direct skill match
    githubLanguage: 0.20,      // GitHub language frequency
    repoRelevance: 0.15,       // Repo name relevance
    complementary: 0.20,       // Adjacent/related skills
} as const;

/** Input for the matching engine */
export interface MatchingEngineInput {
    projectId: string;
    requiredSkills: string[];
    projectDescription: string;
    projectKeywords: string[];    // extracted from description/title
}

/** User candidate for matching */
export interface MatchCandidate {
    id: string;
    skills: string[];
    githubUsername: string | null;
    githubLanguages?: Record<string, number>;
    githubTopics?: string[];
    githubRepoNames?: string[];
}
