import { CredibilitySummary } from '@/services/credibility/types';
import { MatchLabel } from './shared-types';

/** Result from the teammate matching engine */
export interface MatchResult {
    userId: string;
    score: number;            // 0-100 final weighted score
    matchedSkills: string[];  // skills that matched
    confidence: number;       // 0-1 confidence in the match
    label: MatchLabel;
    details: TeammateMatchDetails;
    /** Credibility data (populated when available) */
    credibility?: CredibilitySummary;
}

/** Breakdown of match scoring components */
export interface TeammateMatchDetails {
    skillOverlapScore: number;       // 0-100
    githubLanguageScore: number;     // 0-100
    repoRelevanceScore: number;      // 0-100
    complementaryScore: number;      // 0-100
    credibilityScore: number;        // 0-100 (from credibility engine)
    missingSkills: string[];
}

/** Weights for teammate matching (total = 1.0) */
export const TEAMMATE_SCORE_WEIGHTS = {
    skillOverlap: 0.35,        // Direct skill match (was 0.45, reduced)
    githubLanguage: 0.15,      // GitHub language frequency (was 0.20)
    repoRelevance: 0.10,       // Repo name relevance (was 0.15)
    complementary: 0.15,       // Adjacent/related skills (was 0.20)
    credibility: 0.25,         // NEW: credibility score from 5-pillar engine
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
    /** Pre-fetched credibility summary (optional, computed by service) */
    credibility?: CredibilitySummary;
}
