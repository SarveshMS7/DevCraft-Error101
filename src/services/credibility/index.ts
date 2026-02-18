/**
 * Credibility Scoring System — Public API
 *
 * Usage:
 *   import { getUserCredibility, getBatchCredibilitySummaries } from '@/services/credibility';
 */

// Types
export type {
    CredibilityScoreBreakdown,
    CredibilitySummary,
    CredibilityInput,
    SkillEvidenceBreakdown,
    ExecutionProofBreakdown,
    SocialValidationBreakdown,
    ReliabilityBreakdown,
    ConsistencyBreakdown,
} from './types';

export { CREDIBILITY_WEIGHTS } from './types';

// Engine
export {
    computeCredibilityScore,
    getCredibilitySummary,
    computeBaselineCredibility,
} from './engine';

// Service (data fetching + caching)
export {
    getUserCredibility,
    getUserCredibilitySummary,
    getBatchCredibilitySummaries,
} from './service';
