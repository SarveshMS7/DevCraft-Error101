/**
 * ═══════════════════════════════════════════════════════════════
 * CREDIBILITY SCORING SYSTEM — Type Definitions
 * ═══════════════════════════════════════════════════════════════
 *
 * Multi-signal credibility model with 5 pillars:
 *   1. Skill Evidence     (25%)
 *   2. Execution Proof    (30%)
 *   3. Social Validation  (15%)
 *   4. Reliability        (20%)
 *   5. Consistency        (10%)
 *
 * Designed to be:
 *   - Modular: each pillar is independently replaceable
 *   - Explainable: every score includes a human-readable breakdown
 *   - AI-ready: structured for future ML-based scoring
 */

// ─── Pillar Weights ──────────────────────────────────────────

export const CREDIBILITY_WEIGHTS = {
    skillEvidence: 0.25,
    executionProof: 0.30,
    socialValidation: 0.15,
    reliability: 0.20,
    consistency: 0.10,
} as const;

// ─── Pillar 1: Skill Evidence ────────────────────────────────

export type VerificationType =
    | 'self_declared'
    | 'quiz_passed'
    | 'peer_verified'
    | 'project_proven'
    | 'github_verified';

export type ProficiencyLevel =
    | 'beginner'
    | 'intermediate'
    | 'advanced'
    | 'expert';

/** Confidence multipliers per verification type */
export const VERIFICATION_CONFIDENCE: Record<VerificationType, number> = {
    self_declared: 0.3,
    quiz_passed: 0.8,
    peer_verified: 0.6,
    project_proven: 0.9,
    github_verified: 0.7,
};

/** Proficiency multipliers */
export const PROFICIENCY_MULTIPLIER: Record<ProficiencyLevel, number> = {
    beginner: 0.4,
    intermediate: 0.6,
    advanced: 0.85,
    expert: 1.0,
};

export interface SkillEvidenceInput {
    declaredSkills: string[];
    verifiedSkills: {
        skill: string;
        type: VerificationType;
        proficiency: ProficiencyLevel;
    }[];
    githubLanguages: Record<string, number>;
    githubTopics: string[];
}

export interface SkillEvidenceBreakdown {
    score: number;                  // 0-100
    verifiedCount: number;
    declaredCount: number;
    githubSignalCount: number;
    verificationBonus: number;      // extra points from high-confidence verifications
    confidenceDecay: number;        // penalty for unverified skills
    signals: string[];              // human-readable explanations
}

// ─── Pillar 2: Execution Proof ───────────────────────────────

export interface ProjectRecord {
    projectId: string;
    title: string;
    role: 'leader' | 'member';
    status: 'open' | 'in_progress' | 'completed';
    requiredSkills: string[];
    teamSize: number;
    createdAt: string;
}

export interface ExecutionProofInput {
    completedProjects: ProjectRecord[];
    activeProjects: ProjectRecord[];
    allProjects: ProjectRecord[];
    hasPortfolio: boolean;
}

export interface ExecutionProofBreakdown {
    score: number;                  // 0-100
    completedCount: number;
    leaderCount: number;
    avgComplexity: number;          // 0-100 complexity estimate
    portfolioBonus: number;
    roleBonus: number;              // bonus from leadership roles
    signals: string[];
}

// ─── Pillar 3: Social Validation ─────────────────────────────

export interface EndorsementRecord {
    endorserId: string;
    endorsedId: string;
    skillName: string;
    projectId?: string;
    endorserCredibility?: number;   // 0-100 credibility of the endorser
}

export interface SocialValidationInput {
    endorsements: EndorsementRecord[];
    uniqueCollaborators: Set<string>;
    repeatCollaborators: number;    // users who've worked on 2+ projects together
}

export interface SocialValidationBreakdown {
    score: number;                  // 0-100
    endorsementCount: number;
    uniqueEndorsers: number;
    repeatCollaboratorCount: number;
    endorserQualityBonus: number;   // bonus from high-credibility endorsers
    diminishingReturns: boolean;    // true if endorsements hit diminishing returns
    signals: string[];
}

// ─── Pillar 4: Reliability ───────────────────────────────────

export interface ReliabilityInput {
    totalProjectsJoined: number;
    projectsCompleted: number;
    projectsAbandoned: number;
    invitesReceived: number;
    invitesAccepted: number;
    invitesRejected: number;
    invitesIgnored: number;        // pending for >7 days
    lastActiveAt: Date | null;
    accountCreatedAt: Date;
}

export interface ReliabilityBreakdown {
    score: number;                  // 0-100
    completionRate: number;         // 0-100%
    inviteResponseRate: number;     // 0-100%
    dropoutPenalty: number;         // 0-50 penalty amount
    recencyBonus: number;           // 0-20 bonus
    inactivityPenalty: number;      // 0-30 penalty
    signals: string[];
}

// ─── Pillar 5: Consistency Over Time ─────────────────────────

export interface ActivityRecord {
    date: Date;
    type: string;
}

export interface ConsistencyInput {
    activityLog: ActivityRecord[];
    accountAge: number;             // in days
    skillChanges: number;           // how many times skills were modified
}

export interface ConsistencyBreakdown {
    score: number;                  // 0-100
    activeMonths: number;           // months with activity
    totalMonths: number;            // months since account creation
    activityRatio: number;          // activeMonths / totalMonths
    burstPenalty: number;           // penalty for burst-only activity
    steadinessBonus: number;        // bonus for consistent monthly activity
    signals: string[];
}

// ─── Composite Output ────────────────────────────────────────

export interface CredibilityScoreBreakdown {
    /** Raw credibility score (0-100), weighted sum of all pillars */
    credibilityScore: number;

    /** Data confidence multiplier (0-1), based on available signals */
    confidenceMultiplier: number;

    /** Final ranking score: credibilityScore × confidenceMultiplier (0-100) */
    finalRankScore: number;

    /** Total number of data points used for scoring */
    dataPointsCount: number;

    /** Per-pillar breakdown */
    pillars: {
        skillEvidence: SkillEvidenceBreakdown;
        executionProof: ExecutionProofBreakdown;
        socialValidation: SocialValidationBreakdown;
        reliability: ReliabilityBreakdown;
        consistency: ConsistencyBreakdown;
    };

    /** Human-readable label */
    label: 'Elite' | 'Trusted' | 'Promising' | 'Emerging' | 'New';

    /** Top signals explaining the score */
    topSignals: string[];

    /** When this score was computed */
    computedAt: string;
}

export interface CredibilityInput {
    userId: string;
    skillEvidence: SkillEvidenceInput;
    executionProof: ExecutionProofInput;
    socialValidation: SocialValidationInput;
    reliability: ReliabilityInput;
    consistency: ConsistencyInput;
}

/** Minimal credibility info for ranking integration */
export interface CredibilitySummary {
    credibilityScore: number;
    finalRankScore: number;
    label: CredibilityScoreBreakdown['label'];
    confidenceMultiplier: number;
}
