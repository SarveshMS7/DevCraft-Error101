/**
 * ═══════════════════════════════════════════════════════════════
 * CREDIBILITY SCORING ENGINE — Composite Scorer
 * ═══════════════════════════════════════════════════════════════
 *
 * Combines all 5 pillar scores into a final credibility score.
 * Applies a confidence multiplier based on data volume.
 *
 * Formula:
 *   credibility_score = Σ (pillar_score × pillar_weight)
 *   confidence = f(data_points_available)
 *   final_rank_score = credibility_score × confidence
 */

import {
    CredibilityInput,
    CredibilityScoreBreakdown,
    CredibilitySummary,
    CREDIBILITY_WEIGHTS,
} from './types';

import {
    computeSkillEvidence,
    computeExecutionProof,
    computeSocialValidation,
    computeReliability,
    computeConsistency,
} from './pillars';

// ─── Confidence Multiplier ───────────────────────────────────

/**
 * Calculate confidence based on available data volume.
 * Prevents sparse profiles from being over-ranked.
 *
 * Signal weights:
 *   - Has declared skills: +0.15
 *   - Has verified skills: +0.15
 *   - Has GitHub data: +0.15
 *   - Has completed projects: +0.20
 *   - Has endorsements: +0.10
 *   - Has activity history: +0.10
 *   - Has portfolio: +0.05
 *   - Account age > 7 days: +0.05
 *   - Has collaborators: +0.05
 *
 * Returns 0.0 - 1.0
 */
function computeConfidenceMultiplier(input: CredibilityInput): { multiplier: number; dataPoints: number } {
    let confidence = 0;
    let dataPoints = 0;

    const { skillEvidence, executionProof, socialValidation, reliability, consistency } = input;

    // Skill signals
    if (skillEvidence.declaredSkills.length > 0) {
        confidence += 0.15;
        dataPoints += skillEvidence.declaredSkills.length;
    }
    if (skillEvidence.verifiedSkills.length > 0) {
        confidence += 0.15;
        dataPoints += skillEvidence.verifiedSkills.length;
    }
    if (Object.keys(skillEvidence.githubLanguages).length > 0 || skillEvidence.githubTopics.length > 0) {
        confidence += 0.15;
        dataPoints += Object.keys(skillEvidence.githubLanguages).length + skillEvidence.githubTopics.length;
    }

    // Execution signals
    if (executionProof.completedProjects.length > 0) {
        confidence += 0.20;
        dataPoints += executionProof.completedProjects.length;
    } else if (executionProof.activeProjects.length > 0) {
        confidence += 0.10; // partial credit for active but not completed
        dataPoints += executionProof.activeProjects.length;
    }

    // Social signals
    if (socialValidation.endorsements.length > 0) {
        confidence += 0.10;
        dataPoints += socialValidation.endorsements.length;
    }
    if (socialValidation.uniqueCollaborators.size > 0) {
        confidence += 0.05;
        dataPoints += socialValidation.uniqueCollaborators.size;
    }

    // Activity signals
    if (consistency.activityLog.length > 0) {
        confidence += 0.10;
        dataPoints += consistency.activityLog.length;
    }

    // Portfolio
    if (executionProof.hasPortfolio) {
        confidence += 0.05;
        dataPoints++;
    }

    // Account maturity
    const accountAgeDays = (Date.now() - reliability.accountCreatedAt.getTime()) / (1000 * 60 * 60 * 24);
    if (accountAgeDays > 7) {
        confidence += 0.05;
    }

    // Clamp to [0.1, 1.0] — minimum 10% confidence even for empty profiles
    const multiplier = Math.min(1.0, Math.max(0.1, confidence));

    return { multiplier: Math.round(multiplier * 100) / 100, dataPoints };
}

// ─── Score Label ─────────────────────────────────────────────

function getCredibilityLabel(score: number): CredibilityScoreBreakdown['label'] {
    if (score >= 80) return 'Elite';
    if (score >= 60) return 'Trusted';
    if (score >= 40) return 'Promising';
    if (score >= 20) return 'Emerging';
    return 'New';
}

// ─── Main Engine ─────────────────────────────────────────────

/**
 * Compute the full credibility score for a user.
 *
 * Returns explainable breakdown with per-pillar scores,
 * confidence multiplier, and top signals.
 */
export function computeCredibilityScore(input: CredibilityInput): CredibilityScoreBreakdown {
    // 1. Compute each pillar independently
    const skillEvidence = computeSkillEvidence(input.skillEvidence);
    const executionProof = computeExecutionProof(input.executionProof);
    const socialValidation = computeSocialValidation(input.socialValidation);
    const reliability = computeReliability(input.reliability);
    const consistency = computeConsistency(input.consistency);

    // 2. Weighted sum
    const credibilityScore = Math.round(
        skillEvidence.score * CREDIBILITY_WEIGHTS.skillEvidence +
        executionProof.score * CREDIBILITY_WEIGHTS.executionProof +
        socialValidation.score * CREDIBILITY_WEIGHTS.socialValidation +
        reliability.score * CREDIBILITY_WEIGHTS.reliability +
        consistency.score * CREDIBILITY_WEIGHTS.consistency
    );

    const clampedCredibility = Math.min(100, Math.max(0, credibilityScore));

    // 3. Confidence multiplier
    const { multiplier: confidenceMultiplier, dataPoints: dataPointsCount } =
        computeConfidenceMultiplier(input);

    // 4. Final rank score
    const finalRankScore = Math.round(clampedCredibility * confidenceMultiplier);

    // 5. Aggregate top signals (max 5, prioritize highest-impact)
    const allSignals = [
        ...executionProof.signals,   // execution is the strongest signal
        ...skillEvidence.signals,
        ...reliability.signals,
        ...socialValidation.signals,
        ...consistency.signals,
    ];
    const topSignals = allSignals.slice(0, 5);

    return {
        credibilityScore: clampedCredibility,
        confidenceMultiplier,
        finalRankScore,
        dataPointsCount,
        pillars: {
            skillEvidence,
            executionProof,
            socialValidation,
            reliability,
            consistency,
        },
        label: getCredibilityLabel(finalRankScore),
        topSignals,
        computedAt: new Date().toISOString(),
    };
}

/**
 * Quick credibility summary for ranking integration.
 * Use this when you only need the score, not the full breakdown.
 */
export function getCredibilitySummary(input: CredibilityInput): CredibilitySummary {
    const full = computeCredibilityScore(input);
    return {
        credibilityScore: full.credibilityScore,
        finalRankScore: full.finalRankScore,
        label: full.label,
        confidenceMultiplier: full.confidenceMultiplier,
    };
}

/**
 * Compute credibility for a user with NO data at all (brand new user).
 * Returns baseline scores so the system never errors on empty profiles.
 */
export function computeBaselineCredibility(): CredibilityScoreBreakdown {
    return computeCredibilityScore({
        userId: '',
        skillEvidence: {
            declaredSkills: [],
            verifiedSkills: [],
            githubLanguages: {},
            githubTopics: [],
        },
        executionProof: {
            completedProjects: [],
            activeProjects: [],
            allProjects: [],
            hasPortfolio: false,
        },
        socialValidation: {
            endorsements: [],
            uniqueCollaborators: new Set(),
            repeatCollaborators: 0,
        },
        reliability: {
            totalProjectsJoined: 0,
            projectsCompleted: 0,
            projectsAbandoned: 0,
            invitesReceived: 0,
            invitesAccepted: 0,
            invitesRejected: 0,
            invitesIgnored: 0,
            lastActiveAt: null,
            accountCreatedAt: new Date(),
        },
        consistency: {
            activityLog: [],
            accountAge: 0,
            skillChanges: 0,
        },
    });
}
