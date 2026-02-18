/**
 * ═══════════════════════════════════════════════════════════════
 * CREDIBILITY SCORING ENGINE — Pillar Implementations
 * ═══════════════════════════════════════════════════════════════
 *
 * Each pillar is implemented as an independent, pure function:
 *   computeSkillEvidence()
 *   computeExecutionProof()
 *   computeSocialValidation()
 *   computeReliability()
 *   computeConsistency()
 *
 * All functions return 0-100 scores with explainable breakdowns.
 * Designed to be individually replaceable with AI models.
 */

import {
    SkillEvidenceInput,
    SkillEvidenceBreakdown,
    ExecutionProofInput,
    ExecutionProofBreakdown,
    SocialValidationInput,
    SocialValidationBreakdown,
    ReliabilityInput,
    ReliabilityBreakdown,
    ConsistencyInput,
    ConsistencyBreakdown,
    VERIFICATION_CONFIDENCE,
    PROFICIENCY_MULTIPLIER,
} from './types';

// ─── Helpers ─────────────────────────────────────────────────

const clamp = (v: number, min = 0, max = 100): number =>
    Math.min(max, Math.max(min, Math.round(v)));

const daysSince = (date: Date): number =>
    Math.max(0, (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));


// ═══════════════════════════════════════════════════════════════
// PILLAR 1: SKILL EVIDENCE (25%)
// ═══════════════════════════════════════════════════════════════

export function computeSkillEvidence(input: SkillEvidenceInput): SkillEvidenceBreakdown {
    const signals: string[] = [];
    const { declaredSkills, verifiedSkills, githubLanguages, githubTopics } = input;

    // --- Base: declared skills with confidence decay ---
    const declaredCount = declaredSkills.length;
    const DECAY_PER_UNVERIFIED = 0.5; // Each unverified skill contributes 50% weight
    let declaredScore = 0;

    if (declaredCount > 0) {
        // Cap at 8 skills to prevent gaming
        const cappedDeclared = Math.min(declaredCount, 8);
        declaredScore = (cappedDeclared / 8) * 40 * DECAY_PER_UNVERIFIED;
        signals.push(`${declaredCount} self-declared skill${declaredCount !== 1 ? 's' : ''}`);
    }

    // --- Verified skills: high confidence ---
    let verificationBonus = 0;
    const verifiedCount = verifiedSkills.length;

    if (verifiedCount > 0) {
        verifiedSkills.forEach(vs => {
            const typeConf = VERIFICATION_CONFIDENCE[vs.type] || 0.3;
            const profMult = PROFICIENCY_MULTIPLIER[vs.proficiency] || 0.6;
            verificationBonus += typeConf * profMult * 12; // max ~10.8 per verified skill
        });
        // Cap verification bonus at 45 points
        verificationBonus = Math.min(45, verificationBonus);
        signals.push(`${verifiedCount} verified skill${verifiedCount !== 1 ? 's' : ''} (+${Math.round(verificationBonus)} pts)`);
    }

    // --- GitHub-derived signals ---
    let githubSignalCount = 0;
    const langCount = Object.keys(githubLanguages).length;
    const topicCount = githubTopics.length;
    githubSignalCount = langCount + topicCount;

    let githubScore = 0;
    if (langCount > 0) {
        // Reward language diversity (capped at 10)
        githubScore += Math.min(10, langCount) * 1.5;
        signals.push(`${langCount} GitHub language${langCount !== 1 ? 's' : ''} detected`);
    }
    if (topicCount > 0) {
        githubScore += Math.min(8, topicCount) * 1.0;
        signals.push(`${topicCount} GitHub topic${topicCount !== 1 ? 's' : ''} found`);
    }
    githubScore = Math.min(25, githubScore);

    // --- Confidence decay for unverified skills ---
    const verifiedSkillNames = new Set(verifiedSkills.map(v => v.skill.toLowerCase()));
    const unverifiedCount = declaredSkills.filter(
        s => !verifiedSkillNames.has(s.toLowerCase())
    ).length;
    const confidenceDecay = unverifiedCount > 0
        ? Math.min(15, unverifiedCount * 2)
        : 0;

    if (confidenceDecay > 0) {
        signals.push(`-${confidenceDecay} pts: ${unverifiedCount} unverified skill${unverifiedCount !== 1 ? 's' : ''}`);
    }

    const score = clamp(declaredScore + verificationBonus + githubScore - confidenceDecay);

    return {
        score,
        verifiedCount,
        declaredCount,
        githubSignalCount,
        verificationBonus: Math.round(verificationBonus),
        confidenceDecay,
        signals,
    };
}


// ═══════════════════════════════════════════════════════════════
// PILLAR 2: EXECUTION PROOF (30%)
// ═══════════════════════════════════════════════════════════════

export function computeExecutionProof(input: ExecutionProofInput): ExecutionProofBreakdown {
    const signals: string[] = [];
    const { completedProjects, activeProjects, allProjects, hasPortfolio } = input;

    const completedCount = completedProjects.length;
    const leaderCount = allProjects.filter(p => p.role === 'leader').length;

    // --- Completed projects (strongest signal, up to 40 pts) ---
    // Diminishing returns: 1st=15, 2nd=12, 3rd=8, 4th+=5
    let completionScore = 0;
    const completionValues = [15, 12, 8, 5, 5, 5, 5, 5];
    for (let i = 0; i < Math.min(completedCount, completionValues.length); i++) {
        completionScore += completionValues[i];
    }
    completionScore = Math.min(40, completionScore);

    if (completedCount > 0) {
        signals.push(`${completedCount} completed project${completedCount !== 1 ? 's' : ''} (+${completionScore} pts)`);
    }

    // --- Active projects bonus (up to 10 pts) ---
    const activeScore = Math.min(10, activeProjects.length * 5);
    if (activeProjects.length > 0) {
        signals.push(`${activeProjects.length} active project${activeProjects.length !== 1 ? 's' : ''}`);
    }

    // --- Role importance bonus (up to 20 pts) ---
    let roleBonus = 0;
    if (leaderCount > 0) {
        roleBonus = Math.min(20, leaderCount * 7);
        signals.push(`Led ${leaderCount} project${leaderCount !== 1 ? 's' : ''} (+${roleBonus} pts)`);
    }
    const memberCount = allProjects.filter(p => p.role === 'member').length;
    if (memberCount > 0) {
        roleBonus += Math.min(10, memberCount * 3);
    }
    roleBonus = Math.min(25, roleBonus);

    // --- Project complexity estimate (up to 15 pts) ---
    let avgComplexity = 0;
    if (completedProjects.length > 0) {
        const complexities = completedProjects.map(p => {
            let c = 0;
            c += Math.min(30, (p.requiredSkills?.length || 0) * 6);  // more skills = more complex
            c += Math.min(30, (p.teamSize || 1) * 5);                // larger team = more complex
            return Math.min(100, c);
        });
        avgComplexity = Math.round(complexities.reduce((a, b) => a + b, 0) / complexities.length);
    }
    const complexityScore = Math.min(15, Math.round(avgComplexity * 0.15));

    // --- Portfolio bonus (up to 10 pts) ---
    const portfolioBonus = hasPortfolio ? 10 : 0;
    if (hasPortfolio) {
        signals.push('Portfolio link provided (+10 pts)');
    }

    const score = clamp(completionScore + activeScore + roleBonus + complexityScore + portfolioBonus);

    return {
        score,
        completedCount,
        leaderCount,
        avgComplexity,
        portfolioBonus,
        roleBonus,
        signals,
    };
}


// ═══════════════════════════════════════════════════════════════
// PILLAR 3: SOCIAL VALIDATION (15%)
// ═══════════════════════════════════════════════════════════════

export function computeSocialValidation(input: SocialValidationInput): SocialValidationBreakdown {
    const signals: string[] = [];
    const { endorsements, uniqueCollaborators, repeatCollaborators } = input;

    const endorsementCount = endorsements.length;

    // --- Unique endorsers (diminishing returns after 5) ---
    const uniqueEndorsers = new Set(endorsements.map(e => e.endorserId)).size;
    // First 5 endorsers: 8pts each, next 5: 4pts each, rest: 2pts each
    let endorsementScore = 0;
    const diminishingReturns = uniqueEndorsers > 5;

    for (let i = 0; i < uniqueEndorsers; i++) {
        if (i < 5) endorsementScore += 8;
        else if (i < 10) endorsementScore += 4;
        else endorsementScore += 2;
    }
    endorsementScore = Math.min(50, endorsementScore);

    if (endorsementCount > 0) {
        signals.push(`${endorsementCount} endorsement${endorsementCount !== 1 ? 's' : ''} from ${uniqueEndorsers} unique peer${uniqueEndorsers !== 1 ? 's' : ''}`);
    }
    if (diminishingReturns) {
        signals.push('Endorsement diminishing returns applied');
    }

    // --- Endorser quality bonus ---
    let endorserQualityBonus = 0;
    const highCredEndorsers = endorsements.filter(
        e => (e.endorserCredibility || 0) >= 60
    ).length;
    if (highCredEndorsers > 0) {
        endorserQualityBonus = Math.min(15, highCredEndorsers * 5);
        signals.push(`${highCredEndorsers} endorsement${highCredEndorsers !== 1 ? 's' : ''} from credible users (+${endorserQualityBonus} pts)`);
    }

    // --- Repeat collaborators (trust signal, up to 20 pts) ---
    let collabScore = 0;
    if (repeatCollaborators > 0) {
        collabScore = Math.min(20, repeatCollaborators * 7);
        signals.push(`${repeatCollaborators} repeat collaborator${repeatCollaborators !== 1 ? 's' : ''} (+${collabScore} pts)`);
    }

    // --- Collaborator diversity (up to 15 pts) ---
    const collabDiversity = Math.min(15, uniqueCollaborators.size * 3);
    if (uniqueCollaborators.size > 0) {
        signals.push(`Worked with ${uniqueCollaborators.size} unique collaborator${uniqueCollaborators.size !== 1 ? 's' : ''}`);
    }

    const score = clamp(endorsementScore + endorserQualityBonus + collabScore + collabDiversity);

    return {
        score,
        endorsementCount,
        uniqueEndorsers,
        repeatCollaboratorCount: repeatCollaborators,
        endorserQualityBonus,
        diminishingReturns,
        signals,
    };
}


// ═══════════════════════════════════════════════════════════════
// PILLAR 4: RELIABILITY (20%)
// ═══════════════════════════════════════════════════════════════

export function computeReliability(input: ReliabilityInput): ReliabilityBreakdown {
    const signals: string[] = [];
    const {
        totalProjectsJoined,
        projectsCompleted,
        projectsAbandoned,
        invitesReceived,
        invitesAccepted,
        invitesRejected,
        invitesIgnored,
        lastActiveAt,
        accountCreatedAt,
    } = input;

    // --- Project completion rate (up to 40 pts) ---
    let completionRate = 0;
    if (totalProjectsJoined > 0) {
        completionRate = Math.round((projectsCompleted / totalProjectsJoined) * 100);
    } else {
        completionRate = 50; // Neutral for new users
    }
    const completionScore = Math.round(completionRate * 0.4);
    signals.push(`Project completion rate: ${completionRate}%`);

    // --- Invite response rate (up to 20 pts) ---
    let inviteResponseRate = 100;
    const totalInviteActions = invitesAccepted + invitesRejected + invitesIgnored;
    if (invitesReceived > 0 && totalInviteActions > 0) {
        // Responded = accepted + rejected (both are valid responses)
        const responded = invitesAccepted + invitesRejected;
        inviteResponseRate = Math.round((responded / invitesReceived) * 100);
    }
    const responseScore = Math.round(inviteResponseRate * 0.2);
    if (invitesReceived > 0) {
        signals.push(`Invite response rate: ${inviteResponseRate}%`);
    }

    // --- Dropout penalty (up to -30 pts) ---
    let dropoutPenalty = 0;
    if (projectsAbandoned > 0) {
        // Heavy penalty: 10pts per abandoned project, max -30
        dropoutPenalty = Math.min(30, projectsAbandoned * 10);
        signals.push(`-${dropoutPenalty} pts: ${projectsAbandoned} abandoned project${projectsAbandoned !== 1 ? 's' : ''}`);
    }

    // --- Recency bonus (up to 20 pts) ---
    let recencyBonus = 0;
    if (lastActiveAt) {
        const daysSinceActive = daysSince(lastActiveAt);
        if (daysSinceActive <= 1) recencyBonus = 20;
        else if (daysSinceActive <= 7) recencyBonus = 15;
        else if (daysSinceActive <= 14) recencyBonus = 10;
        else if (daysSinceActive <= 30) recencyBonus = 5;
        else recencyBonus = 0;

        if (recencyBonus > 0) {
            signals.push(`Active ${daysSinceActive <= 1 ? 'today' : `${Math.round(daysSinceActive)} days ago`} (+${recencyBonus})`);
        }
    }

    // --- Inactivity penalty (up to -20 pts) ---
    let inactivityPenalty = 0;
    if (lastActiveAt) {
        const daysInactive = daysSince(lastActiveAt);
        if (daysInactive > 60) {
            inactivityPenalty = Math.min(20, Math.round((daysInactive - 60) * 0.3));
            signals.push(`-${inactivityPenalty} pts: inactive for ${Math.round(daysInactive)} days`);
        }
    } else {
        // Account exists but no activity at all
        const accountAgeDays = daysSince(accountCreatedAt);
        if (accountAgeDays > 7) {
            inactivityPenalty = 10;
            signals.push('-10 pts: no recorded activity');
        }
    }

    const score = clamp(
        completionScore + responseScore + recencyBonus - dropoutPenalty - inactivityPenalty
    );

    return {
        score,
        completionRate,
        inviteResponseRate,
        dropoutPenalty,
        recencyBonus,
        inactivityPenalty,
        signals,
    };
}


// ═══════════════════════════════════════════════════════════════
// PILLAR 5: CONSISTENCY OVER TIME (10%)
// ═══════════════════════════════════════════════════════════════

export function computeConsistency(input: ConsistencyInput): ConsistencyBreakdown {
    const signals: string[] = [];
    const { activityLog, accountAge, skillChanges } = input;

    // Total months since account creation (min 1)
    const totalMonths = Math.max(1, Math.ceil(accountAge / 30));

    // --- Count active months ---
    const activeMonthSet = new Set<string>();
    activityLog.forEach(entry => {
        const d = new Date(entry.date);
        activeMonthSet.add(`${d.getFullYear()}-${d.getMonth()}`);
    });
    const activeMonths = activeMonthSet.size;

    // --- Activity ratio (up to 40 pts) ---
    let activityRatio = totalMonths > 0 ? activeMonths / totalMonths : 0;
    activityRatio = Math.min(1, activityRatio);
    const ratioScore = Math.round(activityRatio * 40);
    signals.push(`Active in ${activeMonths}/${totalMonths} month${totalMonths !== 1 ? 's' : ''}`);

    // --- Steadiness bonus (up to 30 pts) ---
    // Reward consecutive months of activity
    let steadinessBonus = 0;
    if (activeMonths >= 3) {
        // Check for consecutive months
        const sortedMonths = Array.from(activeMonthSet).sort();
        let maxConsecutive = 1;
        let currentStreak = 1;

        for (let i = 1; i < sortedMonths.length; i++) {
            const [prevY, prevM] = sortedMonths[i - 1].split('-').map(Number);
            const [currY, currM] = sortedMonths[i].split('-').map(Number);
            const expectedMonth = prevM === 11 ? 0 : prevM + 1;
            const expectedYear = prevM === 11 ? prevY + 1 : prevY;

            if (currY === expectedYear && currM === expectedMonth) {
                currentStreak++;
                maxConsecutive = Math.max(maxConsecutive, currentStreak);
            } else {
                currentStreak = 1;
            }
        }

        steadinessBonus = Math.min(30, maxConsecutive * 6);
        if (maxConsecutive >= 3) {
            signals.push(`${maxConsecutive}-month activity streak (+${steadinessBonus} pts)`);
        }
    }

    // --- Burst penalty (up to -20 pts) ---
    // Penalize users who are only active in 1-2 months but with heavy activity
    let burstPenalty = 0;
    if (activeMonths <= 2 && activityLog.length > 10 && totalMonths > 3) {
        burstPenalty = Math.min(20, Math.round((activityLog.length / activeMonths) * 0.5));
        signals.push(`-${burstPenalty} pts: burst activity pattern`);
    }

    // --- Skill consistency bonus (up to 15 pts) ---
    // Low skill changes = more stable
    let skillConsistency = 15;
    if (skillChanges > 5) {
        skillConsistency = Math.max(0, 15 - (skillChanges - 5) * 3);
        if (skillChanges > 8) {
            signals.push(`Frequent skill changes (-${15 - skillConsistency} pts)`);
        }
    }

    // --- Account age bonus (up to 15 pts) ---
    const ageBonus = Math.min(15, Math.round(totalMonths * 1.5));

    const score = clamp(ratioScore + steadinessBonus + skillConsistency + ageBonus - burstPenalty);

    return {
        score,
        activeMonths,
        totalMonths,
        activityRatio: Math.round(activityRatio * 100) / 100,
        burstPenalty,
        steadinessBonus,
        signals,
    };
}
