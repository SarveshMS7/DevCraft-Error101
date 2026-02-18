/**
 * ═══════════════════════════════════════════════════════════════
 * CREDIBILITY DATA SERVICE
 * ═══════════════════════════════════════════════════════════════
 *
 * Fetches all required data from Supabase and assembles the
 * CredibilityInput for the scoring engine.
 *
 * Also handles caching the result in user_credibility_cache.
 */

import { supabase } from '@/lib/supabase';
import { githubService } from '@/services/github/api';
import {
    CredibilityInput,
    CredibilityScoreBreakdown,
    CredibilitySummary,
    SkillEvidenceInput,
    ExecutionProofInput,
    SocialValidationInput,
    ReliabilityInput,
    ConsistencyInput,
    ProjectRecord,
    EndorsementRecord,
    ActivityRecord,
    VerificationType,
    ProficiencyLevel,
} from './types';
import { computeCredibilityScore } from './engine';

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// ─── Cache Check ─────────────────────────────────────────────

async function getCachedCredibility(userId: string): Promise<CredibilitySummary | null> {
    // @ts-ignore
    const { data, error } = await supabase
        .from('user_credibility_cache')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

    if (error || !data) return null;

    const row = data as any;
    const expiresAt = new Date(row.expires_at);
    if (expiresAt <= new Date()) return null; // expired

    return {
        credibilityScore: row.credibility_score,
        finalRankScore: row.final_rank_score,
        label: getLabelFromScore(row.final_rank_score),
        confidenceMultiplier: row.confidence_multiplier,
    };
}

async function setCachedCredibility(userId: string, result: CredibilityScoreBreakdown): Promise<void> {
    // @ts-ignore
    const { error } = await supabase
        .from('user_credibility_cache')
        // @ts-ignore
        .upsert({
            user_id: userId,
            credibility_score: result.credibilityScore,
            confidence_multiplier: result.confidenceMultiplier,
            final_rank_score: result.finalRankScore,
            skill_evidence_score: result.pillars.skillEvidence.score,
            execution_proof_score: result.pillars.executionProof.score,
            social_validation_score: result.pillars.socialValidation.score,
            reliability_score: result.pillars.reliability.score,
            consistency_score: result.pillars.consistency.score,
            data_points_count: result.dataPointsCount,
            last_computed: new Date().toISOString(),
            expires_at: new Date(Date.now() + CACHE_TTL_MS).toISOString(),
        }, { onConflict: 'user_id' });

    if (error) {
        console.error('Failed to cache credibility score:', error);
    }
}

function getLabelFromScore(score: number): CredibilitySummary['label'] {
    if (score >= 80) return 'Elite';
    if (score >= 60) return 'Trusted';
    if (score >= 40) return 'Promising';
    if (score >= 20) return 'Emerging';
    return 'New';
}

// ─── Data Fetchers ───────────────────────────────────────────

async function fetchSkillEvidenceData(userId: string, profile: any): Promise<SkillEvidenceInput> {
    const declaredSkills: string[] = profile.skills || [];

    // Fetch verified skills
    // @ts-ignore
    const { data: verifications } = await supabase
        .from('skill_verifications')
        .select('skill_name, verification_type, proficiency')
        .eq('user_id', userId);

    const verifiedSkills = ((verifications || []) as any[]).map((v: any) => ({
        skill: v.skill_name as string,
        type: v.verification_type as VerificationType,
        proficiency: v.proficiency as ProficiencyLevel,
    }));

    // Fetch GitHub data (cached)
    let githubLanguages: Record<string, number> = {};
    let githubTopics: string[] = [];

    if (profile.github_username) {
        try {
            const vector = await githubService.getCachedSkillVector(userId, profile.github_username);
            githubLanguages = vector.languages;
            githubTopics = vector.topics;
        } catch (err) {
            console.warn('GitHub fetch failed for credibility:', err);
        }
    }

    return { declaredSkills, verifiedSkills, githubLanguages, githubTopics };
}

async function fetchExecutionProofData(userId: string, profile: any): Promise<ExecutionProofInput> {
    // Fetch projects where user is owner
    const { data: ownedProjects } = await supabase
        .from('projects')
        .select('id, title, status, required_skills, team_size, created_at')
        .eq('owner_id', userId);

    // Fetch projects where user is a member
    // @ts-ignore
    const { data: memberRecords } = await supabase
        .from('project_members')
        .select('project_id, role')
        .eq('user_id', userId);

    const memberProjectIds = ((memberRecords || []) as any[]).map((m: any) => m.project_id);
    let memberProjects: any[] = [];

    if (memberProjectIds.length > 0) {
        const { data } = await supabase
            .from('projects')
            .select('id, title, status, required_skills, team_size, created_at')
            .in('id', memberProjectIds);
        memberProjects = (data || []) as any[];
    }

    const memberRoleMap = new Map(
        ((memberRecords || []) as any[]).map((m: any) => [m.project_id, m.role])
    );

    // Build project records
    const allRecords: ProjectRecord[] = [];

    ((ownedProjects || []) as any[]).forEach((p: any) => {
        allRecords.push({
            projectId: p.id,
            title: p.title,
            role: 'leader',
            status: p.status || 'open',
            requiredSkills: p.required_skills || [],
            teamSize: p.team_size || 1,
            createdAt: p.created_at,
        });
    });

    memberProjects.forEach((p: any) => {
        // Avoid duplicates (if user is both owner and member somehow)
        if (!allRecords.find(r => r.projectId === p.id)) {
            allRecords.push({
                projectId: p.id,
                title: p.title,
                role: (memberRoleMap.get(p.id) || 'member') as 'leader' | 'member',
                status: p.status || 'open',
                requiredSkills: p.required_skills || [],
                teamSize: p.team_size || 1,
                createdAt: p.created_at,
            });
        }
    });

    const completedProjects = allRecords.filter(p => p.status === 'completed');
    const activeProjects = allRecords.filter(p => p.status === 'open' || p.status === 'in_progress');

    const hasPortfolio = !!(profile.portfolio_url || profile.website);

    return { completedProjects, activeProjects, allProjects: allRecords, hasPortfolio };
}

async function fetchSocialValidationData(userId: string): Promise<SocialValidationInput> {
    // Fetch endorsements received
    // @ts-ignore
    const { data: endorsements } = await supabase
        .from('endorsements')
        .select('endorser_id, endorsed_id, skill_name, project_id')
        .eq('endorsed_id', userId);

    const endorsementRecords: EndorsementRecord[] = ((endorsements || []) as any[]).map((e: any) => ({
        endorserId: e.endorser_id,
        endorsedId: e.endorsed_id,
        skillName: e.skill_name,
        projectId: e.project_id || undefined,
    }));

    // Find unique collaborators (people who've been in the same project)
    // @ts-ignore
    const { data: userMemberships } = await supabase
        .from('project_members')
        .select('project_id')
        .eq('user_id', userId);

    const userProjectIds = ((userMemberships || []) as any[]).map((m: any) => m.project_id);
    const uniqueCollaborators = new Set<string>();
    const projectCounts = new Map<string, number>();

    if (userProjectIds.length > 0) {
        // @ts-ignore
        const { data: coMembers } = await supabase
            .from('project_members')
            .select('user_id, project_id')
            .in('project_id', userProjectIds)
            .neq('user_id', userId);

        ((coMembers || []) as any[]).forEach((m: any) => {
            uniqueCollaborators.add(m.user_id);
            projectCounts.set(m.user_id, (projectCounts.get(m.user_id) || 0) + 1);
        });
    }

    // Count repeat collaborators (2+ shared projects)
    const repeatCollaborators = Array.from(projectCounts.values()).filter(c => c >= 2).length;

    return { endorsements: endorsementRecords, uniqueCollaborators, repeatCollaborators };
}

async function fetchReliabilityData(userId: string, profile: any): Promise<ReliabilityInput> {
    // Count projects by status
    // @ts-ignore
    const { data: memberRecords } = await supabase
        .from('project_members')
        .select('project_id')
        .eq('user_id', userId);

    const memberProjectIds = ((memberRecords || []) as any[]).map((m: any) => m.project_id);
    const totalProjectsJoined = memberProjectIds.length;

    // Owned projects count too
    const { data: ownedProjects } = await supabase
        .from('projects')
        .select('id, status')
        .eq('owner_id', userId);

    const allProjectStatuses: string[] = [];
    ((ownedProjects || []) as any[]).forEach((p: any) => allProjectStatuses.push(p.status || 'open'));

    if (memberProjectIds.length > 0) {
        const { data: memberProjectData } = await supabase
            .from('projects')
            .select('status')
            .in('id', memberProjectIds);
        ((memberProjectData || []) as any[]).forEach((p: any) => allProjectStatuses.push(p.status || 'open'));
    }

    const projectsCompleted = allProjectStatuses.filter(s => s === 'completed').length;

    // Fetch activity log for abandoned projects
    // @ts-ignore
    const { data: abandonedLog } = await supabase
        .from('activity_log')
        .select('id')
        .eq('user_id', userId)
        .eq('action_type', 'project_abandoned');

    const projectsAbandoned = ((abandonedLog || []) as any[]).length;

    // Invite stats
    // @ts-ignore
    const { data: receivedInvites } = await supabase
        .from('project_invites')
        .select('status')
        .eq('receiver_id', userId);

    const invites = (receivedInvites || []) as any[];
    const invitesReceived = invites.length;
    const invitesAccepted = invites.filter((i: any) => i.status === 'accepted').length;
    const invitesRejected = invites.filter((i: any) => i.status === 'rejected').length;
    const invitesIgnored = invites.filter((i: any) => i.status === 'pending').length;

    // Last activity
    // @ts-ignore
    const { data: lastActivity } = await supabase
        .from('activity_log')
        .select('created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    const lastActiveAt = lastActivity
        ? new Date((lastActivity as any).created_at)
        : (profile.updated_at ? new Date(profile.updated_at) : null);

    const accountCreatedAt = profile.updated_at
        ? new Date(profile.updated_at)
        : new Date();

    return {
        totalProjectsJoined: totalProjectsJoined + ((ownedProjects || []).length),
        projectsCompleted,
        projectsAbandoned,
        invitesReceived,
        invitesAccepted,
        invitesRejected,
        invitesIgnored,
        lastActiveAt,
        accountCreatedAt,
    };
}

async function fetchConsistencyData(userId: string, profile: any): Promise<ConsistencyInput> {
    // Fetch full activity log
    // @ts-ignore
    const { data: activities } = await supabase
        .from('activity_log')
        .select('created_at, action_type')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

    const activityLog: ActivityRecord[] = ((activities || []) as any[]).map((a: any) => ({
        date: new Date(a.created_at),
        type: a.action_type,
    }));

    const accountCreated = profile.updated_at
        ? new Date(profile.updated_at)
        : new Date();
    const accountAge = Math.max(0, (Date.now() - accountCreated.getTime()) / (1000 * 60 * 60 * 24));

    // Count skill_added events as skill changes
    const skillChanges = activityLog.filter(
        a => a.type === 'skill_added' || a.type === 'profile_updated'
    ).length;

    return { activityLog, accountAge, skillChanges };
}

// ─── Public API ──────────────────────────────────────────────

/**
 * Get the full credibility score breakdown for a user.
 * Uses cache if available (1h TTL).
 */
export async function getUserCredibility(userId: string): Promise<CredibilityScoreBreakdown> {
    // Fetch profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (profileError || !profile) {
        throw new Error('Profile not found');
    }

    const profileData = profile as any;

    // Fetch all data in parallel
    const [
        skillEvidence,
        executionProof,
        socialValidation,
        reliability,
        consistency,
    ] = await Promise.all([
        fetchSkillEvidenceData(userId, profileData),
        fetchExecutionProofData(userId, profileData),
        fetchSocialValidationData(userId),
        fetchReliabilityData(userId, profileData),
        fetchConsistencyData(userId, profileData),
    ]);

    const input: CredibilityInput = {
        userId,
        skillEvidence,
        executionProof,
        socialValidation,
        reliability,
        consistency,
    };

    // Compute
    const result = computeCredibilityScore(input);

    // Cache the result (non-blocking)
    setCachedCredibility(userId, result).catch(err =>
        console.warn('Cache write failed:', err)
    );

    return result;
}

/**
 * Get credibility summary (cached, fast).
 * Falls back to full computation if cache is empty.
 */
export async function getUserCredibilitySummary(userId: string): Promise<CredibilitySummary> {
    // Try cache first
    const cached = await getCachedCredibility(userId);
    if (cached) return cached;

    // Full computation
    const full = await getUserCredibility(userId);
    return {
        credibilityScore: full.credibilityScore,
        finalRankScore: full.finalRankScore,
        label: full.label,
        confidenceMultiplier: full.confidenceMultiplier,
    };
}

/**
 * Batch-compute credibility summaries for multiple users.
 * Uses cache where available, computes fresh for cache misses.
 */
export async function getBatchCredibilitySummaries(
    userIds: string[]
): Promise<Map<string, CredibilitySummary>> {
    const results = new Map<string, CredibilitySummary>();

    // Parallel fetch (with error isolation per user)
    await Promise.all(
        userIds.map(async (userId) => {
            try {
                const summary = await getUserCredibilitySummary(userId);
                results.set(userId, summary);
            } catch (err) {
                // Graceful fallback: neutral score for failed users
                results.set(userId, {
                    credibilityScore: 0,
                    finalRankScore: 0,
                    label: 'New',
                    confidenceMultiplier: 0.1,
                });
            }
        })
    );

    return results;
}
