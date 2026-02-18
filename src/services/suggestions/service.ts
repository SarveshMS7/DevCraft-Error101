/**
 * Teammate Suggestion Service
 *
 * Orchestrates fetching project data, candidate users, GitHub skills,
 * credibility scores, and the matching engine to produce ranked
 * teammate suggestions.
 */

import { supabase } from '@/lib/supabase';
import { githubService } from '@/services/github/api';
import { getBatchCredibilitySummaries } from '@/services/credibility/service';
import { rankCandidates, extractKeywords } from '@/services/matching/teammate-engine';
import { MatchCandidate, MatchingEngineInput, MatchResult } from '@/services/matching/teammate-types';

export interface SuggestedTeammate extends MatchResult {
    profile: {
        id: string;
        username: string | null;
        full_name: string | null;
        avatar_url: string | null;
        github_username: string | null;
        bio: string | null;
        role: string | null;
        skills: string[] | null;
    };
}

const MAX_SUGGESTIONS = 20;

/**
 * Get suggested teammates for a project.
 *
 * Steps:
 * 1. Fetch the project data.
 * 2. Fetch all users except the project owner.
 * 3. Exclude users already in the team (project_members).
 * 4. Exclude users already invited (project_invites).
 * 5. Enrich candidates with GitHub data (cached).
 * 6. Fetch credibility scores (batch, cached).
 * 7. Run the matching engine.
 * 8. Return top N candidates with profile data.
 */
export async function getSuggestedTeammates(projectId: string): Promise<SuggestedTeammate[]> {
    // 1. Fetch project
    const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

    if (projectError || !project) {
        throw new Error('Project not found');
    }

    const projectData = project as any;
    const requiredSkills: string[] = projectData.required_skills || [];
    const projectKeywords = extractKeywords(
        `${projectData.title} ${projectData.description}`
    );

    // 2. Fetch all profiles except owner
    const { data: allProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', projectData.owner_id);

    if (profilesError || !allProfiles) {
        throw new Error('Failed to fetch profiles');
    }

    // 3. Exclude existing team members
    // @ts-ignore - project_members may not be in generated types yet
    const { data: members } = await supabase
        .from('project_members')
        .select('user_id')
        .eq('project_id', projectId);

    const memberIds = new Set(((members || []) as any[]).map((m: any) => m.user_id));

    // 4. Exclude already-invited users (pending or accepted)
    // @ts-ignore - project_invites may not be in generated types yet
    const { data: invites } = await supabase
        .from('project_invites')
        .select('receiver_id, status')
        .eq('project_id', projectId)
        .in('status', ['pending', 'accepted']);

    const invitedIds = new Set(((invites || []) as any[]).map((i: any) => i.receiver_id));

    // Filter candidates
    const eligibleProfiles = (allProfiles as any[]).filter(
        (p: any) => !memberIds.has(p.id) && !invitedIds.has(p.id)
    );

    // 5. Enrich with GitHub data (parallel, with caching)
    // 6. Fetch credibility scores in batch
    const eligibleIds = eligibleProfiles.map((p: any) => p.id);
    const credibilityMap = await getBatchCredibilitySummaries(eligibleIds);

    const candidates: MatchCandidate[] = await Promise.all(
        eligibleProfiles.map(async (profile: any) => {
            let githubLanguages: Record<string, number> = {};
            let githubTopics: string[] = [];
            let githubRepoNames: string[] = [];

            if (profile.github_username) {
                try {
                    const vector = await githubService.getCachedSkillVector(
                        profile.id,
                        profile.github_username
                    );
                    githubLanguages = vector.languages;
                    githubTopics = vector.topics;
                    githubRepoNames = vector.repoNames;
                } catch (err) {
                    // Graceful fallback for users with private repos or API errors
                    console.warn(`Failed to fetch GitHub data for ${profile.github_username}:`, err);
                }
            }

            return {
                id: profile.id,
                skills: profile.skills || [],
                githubUsername: profile.github_username,
                githubLanguages,
                githubTopics,
                githubRepoNames,
                credibility: credibilityMap.get(profile.id),
            };
        })
    );

    // 7. Run matching engine (now includes credibility as 5th dimension)
    const input: MatchingEngineInput = {
        projectId,
        requiredSkills,
        projectDescription: projectData.description,
        projectKeywords,
    };

    const ranked = rankCandidates(candidates, input);

    // 8. Merge with profile data and return top N
    const profileMap = new Map(eligibleProfiles.map((p: any) => [p.id, p]));
    const suggestions: SuggestedTeammate[] = ranked
        .slice(0, MAX_SUGGESTIONS)
        .map(result => ({
            ...result,
            profile: profileMap.get(result.userId)!,
        }))
        .filter(s => s.profile); // Safety: ensure profile exists

    return suggestions;
}
