/**
 * Teammate Matching Engine
 *
 * Modular, deterministic scoring engine for ranking potential teammates.
 * Designed to be replaceable with AI-based ranking in the future.
 *
 * Scoring components:
 * - Skill overlap (45%): Direct match between user skills and project requirements
 * - GitHub language frequency (20%): Languages from GitHub repos
 * - Repository relevance (15%): Repo names matching project keywords
 * - Complementary skills (20%): Related/adjacent skills bonus
 */

import {
    MatchResult,
    MatchCandidate,
    MatchingEngineInput,
    TeammateMatchDetails,
    TEAMMATE_SCORE_WEIGHTS,
} from './teammate-types';

import { calculateComplementaryScore } from './scoring';

// ─── Skill Overlap Score ──────────────────────────────────────
function computeSkillOverlap(
    userSkills: string[],
    requiredSkills: string[]
): { score: number; matchedSkills: string[]; missingSkills: string[] } {
    if (!requiredSkills || requiredSkills.length === 0) {
        return { score: 100, matchedSkills: [], missingSkills: [] };
    }
    if (!userSkills || userSkills.length === 0) {
        return { score: 0, matchedSkills: [], missingSkills: [...requiredSkills] };
    }

    const userSet = new Set(userSkills.map(s => s.toLowerCase().trim()));
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    requiredSkills.forEach(skill => {
        const normalized = skill.toLowerCase().trim();
        if (userSet.has(normalized)) {
            matchedSkills.push(skill);
        } else {
            missingSkills.push(skill);
        }
    });

    const score = Math.round((matchedSkills.length / requiredSkills.length) * 100);
    return { score, matchedSkills, missingSkills };
}

// ─── GitHub Language Frequency Score ──────────────────────────
function computeGithubLanguageScore(
    userLanguages: Record<string, number> | undefined,
    requiredSkills: string[]
): number {
    if (!userLanguages || Object.keys(userLanguages).length === 0) return 0;
    if (!requiredSkills || requiredSkills.length === 0) return 50; // Neutral

    const languageNames = Object.keys(userLanguages).map(l => l.toLowerCase());
    const requiredLower = requiredSkills.map(s => s.toLowerCase());

    let matchCount = 0;
    requiredLower.forEach(skill => {
        if (languageNames.includes(skill)) {
            matchCount++;
        }
    });

    // Also reward diversity: total unique languages as a bonus
    const diversityBonus = Math.min(15, Object.keys(userLanguages).length * 2);
    const overlapScore = requiredSkills.length > 0
        ? (matchCount / requiredSkills.length) * 85
        : 0;

    return Math.min(100, Math.round(overlapScore + diversityBonus));
}

// ─── Repo Name Relevance Score ────────────────────────────────
function computeRepoRelevanceScore(
    repoNames: string[] | undefined,
    projectKeywords: string[]
): number {
    if (!repoNames || repoNames.length === 0) return 0;
    if (!projectKeywords || projectKeywords.length === 0) return 50;

    const keywordsLower = projectKeywords.map(k => k.toLowerCase());
    let matchCount = 0;

    repoNames.forEach(repoName => {
        const name = repoName.toLowerCase();
        keywordsLower.forEach(keyword => {
            if (keyword.length >= 3 && name.includes(keyword)) {
                matchCount++;
            }
        });
    });

    // Max score = 100, with diminishing returns
    return Math.min(100, Math.round(matchCount * 20));
}

// ─── Extract Keywords from Text ───────────────────────────────
export function extractKeywords(text: string): string[] {
    const stopWords = new Set([
        'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
        'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
        'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
        'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
        'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
        'and', 'but', 'or', 'nor', 'not', 'so', 'yet', 'both', 'either',
        'neither', 'each', 'every', 'all', 'any', 'few', 'more', 'most',
        'other', 'some', 'such', 'no', 'only', 'own', 'same', 'than', 'too',
        'very', 'just', 'because', 'also', 'this', 'that', 'these', 'those',
        'it', 'its', 'we', 'our', 'you', 'your', 'they', 'their', 'them',
        'i', 'me', 'my', 'he', 'she', 'him', 'her', 'his', 'hers', 'who',
        'which', 'what', 'where', 'when', 'how', 'why', 'project', 'team',
        'build', 'create', 'using', 'use', 'want', 'looking', 'help',
    ]);

    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s\-+#]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length >= 3 && !stopWords.has(word))
        .slice(0, 20);
}

// ─── Score Label ──────────────────────────────────────────────
function getTeammateScoreLabel(score: number): MatchResult['label'] {
    if (score >= 75) return 'Excellent';
    if (score >= 50) return 'Good';
    if (score >= 25) return 'Fair';
    return 'Low';
}

// ─── Main Matching Engine ─────────────────────────────────────
/**
 * Score a single candidate against a project's requirements.
 * Returns a MatchResult with score, matched skills, and details.
 */
export function scoreCandidate(
    candidate: MatchCandidate,
    input: MatchingEngineInput
): MatchResult {
    // Build combined user skills: profile skills + GitHub-derived skills
    const profileSkills = candidate.skills || [];
    const githubSkills = [
        ...(candidate.githubTopics || []),
        ...Object.keys(candidate.githubLanguages || {}).map(l => l.toLowerCase()),
    ];
    const allUserSkills = [...new Set([
        ...profileSkills.map(s => s.toLowerCase()),
        ...githubSkills.map(s => s.toLowerCase()),
    ])];

    // 1. Skill overlap
    const { score: skillOverlapScore, matchedSkills, missingSkills } = computeSkillOverlap(
        allUserSkills,
        input.requiredSkills
    );

    // 2. GitHub language frequency
    const githubLanguageScore = computeGithubLanguageScore(
        candidate.githubLanguages,
        input.requiredSkills
    );

    // 3. Repo relevance
    const repoRelevanceScore = computeRepoRelevanceScore(
        candidate.githubRepoNames,
        input.projectKeywords
    );

    // 4. Complementary skills
    const complementaryScore = calculateComplementaryScore(
        allUserSkills,
        input.requiredSkills
    );

    // Weighted final score
    const finalScore = Math.round(
        (skillOverlapScore * TEAMMATE_SCORE_WEIGHTS.skillOverlap) +
        (githubLanguageScore * TEAMMATE_SCORE_WEIGHTS.githubLanguage) +
        (repoRelevanceScore * TEAMMATE_SCORE_WEIGHTS.repoRelevance) +
        (complementaryScore * TEAMMATE_SCORE_WEIGHTS.complementary)
    );

    const clampedScore = Math.min(100, Math.max(0, finalScore));

    // Confidence: higher when we have more data
    const hasGithub = candidate.githubUsername ? 1 : 0;
    const hasSkills = profileSkills.length > 0 ? 1 : 0;
    const hasTopics = (candidate.githubTopics?.length || 0) > 0 ? 1 : 0;
    const confidence = (hasGithub * 0.3 + hasSkills * 0.5 + hasTopics * 0.2);

    const details: TeammateMatchDetails = {
        skillOverlapScore,
        githubLanguageScore,
        repoRelevanceScore,
        complementaryScore,
        missingSkills,
    };

    return {
        userId: candidate.id,
        score: clampedScore,
        matchedSkills,
        confidence,
        label: getTeammateScoreLabel(clampedScore),
        details,
    };
}

/**
 * Rank multiple candidates and return them sorted by score (descending).
 */
export function rankCandidates(
    candidates: MatchCandidate[],
    input: MatchingEngineInput
): MatchResult[] {
    return candidates
        .map(c => scoreCandidate(c, input))
        .sort((a, b) => {
            // Primary: score descending
            if (b.score !== a.score) return b.score - a.score;
            // Secondary: confidence descending
            return b.confidence - a.confidence;
        });
}
