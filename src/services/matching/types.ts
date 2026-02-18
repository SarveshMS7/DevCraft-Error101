export interface MatchUser {
    id: string;
    skills: string[];
    availability?: string;
    timezone?: string;
}

export interface MatchProject {
    id: string;
    required_skills: string[];
    availability_required?: string;
    timezone_preferred?: string;
}

export interface MatchScoreDetails {
    skillOverlap: number;        // 0-100: % of required skills user has
    complementaryScore: number;  // 0-100: related/adjacent skill score
    availabilityScore: number;   // 0-100: availability compatibility
    timezoneScore: number;       // 0-100: timezone overlap
    missingSkills: string[];     // Skills user is missing
}

export interface MatchScore {
    projectId: string;
    score: number;               // 0-100 final weighted score
    details: MatchScoreDetails;
    label: 'Excellent' | 'Good' | 'Fair' | 'Low';
}

/**
 * Weights for the final score calculation.
 * Total must equal 1.0
 */
export const SCORE_WEIGHTS = {
    skillOverlap: 0.55,       // Primary factor: direct skill match
    complementary: 0.20,      // Secondary: adjacent/related skills
    availability: 0.15,       // Tertiary: time availability
    timezone: 0.10,           // Quaternary: timezone overlap
} as const;

/**
 * Score label thresholds
 */
export const getScoreLabel = (score: number): MatchScore['label'] => {
    if (score >= 75) return 'Excellent';
    if (score >= 50) return 'Good';
    if (score >= 25) return 'Fair';
    return 'Low';
};
