import { supabase } from '@/lib/supabase';
import { GithubRawRepo, ProcessedSkill, UserSkillProfile, GithubProfileCache, GitHubSkillVector } from './types';

const CACHE_TTL_HOURS = 24;

/**
 * GitHub Analysis Service
 * Fetches repos, extracts skills, and caches results in Supabase.
 */
export class GithubService {
  // ─── Repo Fetching ──────────────────────────────────────────
  async getUserRepos(username: string): Promise<GithubRawRepo[]> {
    try {
      const url = `https://api.github.com/users/${username}/repos?sort=updated&per_page=30`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch repos');
      }

      const data = await response.json();

      return data.map((repo: any) => ({
        name: repo.name,
        description: repo.description || '',
        language: repo.language || '',
        stargazers_count: repo.stargazers_count,
        html_url: repo.html_url,
        topics: repo.topics || []
      }));
    } catch (error) {
      console.error('Github API Error:', error);
      return [];
    }
  }

  // ─── Skill Processing ──────────────────────────────────────
  async processSkills(username: string): Promise<UserSkillProfile> {
    const repos = await this.getUserRepos(username);

    const skillMap = new Map<string, ProcessedSkill>();
    const languageCounts: Record<string, number> = {};

    repos.forEach(repo => {
      // Process primary language
      if (repo.language) {
        const lang = repo.language;
        languageCounts[lang] = (languageCounts[lang] || 0) + 1;

        if (!skillMap.has(lang)) {
          skillMap.set(lang, {
            name: lang,
            source: 'github_language',
            confidenceScore: 0.8, // Base confidence for a primary language
          });
        }
      }

      // Process topics/tags
      repo.topics?.forEach(topic => {
        if (!skillMap.has(topic)) {
          skillMap.set(topic, {
            name: topic,
            source: 'github_topic',
            confidenceScore: 0.6, // Topics have slightly lower base confidence
          });
        }
      });
    });

    // Sort top languages by frequency
    const topLanguages = Object.entries(languageCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([lang]) => lang);

    return {
      username,
      skills: Array.from(skillMap.values()),
      topLanguages: topLanguages.slice(0, 5)
    };
  }

  // ─── GitHub Skill Vector (for matching engine) ─────────────
  async getSkillVector(username: string): Promise<GitHubSkillVector> {
    const repos = await this.getUserRepos(username);

    const languages: Record<string, number> = {};
    const topicsSet = new Set<string>();
    const repoNames: string[] = [];

    repos.forEach(repo => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
      repo.topics?.forEach(topic => topicsSet.add(topic.toLowerCase()));
      repoNames.push(repo.name.toLowerCase());
    });

    const topics = Array.from(topicsSet);
    const allSkills = [
      ...Object.keys(languages).map(l => l.toLowerCase()),
      ...topics,
    ];

    return {
      languages,
      topics,
      repoNames,
      allSkills: [...new Set(allSkills)],
    };
  }

  // ─── Caching Layer ─────────────────────────────────────────
  /**
   * Get cached GitHub profile. Returns null if not cached or expired.
   */
  async getCachedProfile(userId: string): Promise<GithubProfileCache | null> {
    const { data, error } = await supabase
      .from('github_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return null;

    const row = data as any;

    // Check TTL
    const lastFetched = new Date(row.last_fetched);
    const now = new Date();
    const hoursSinceFetch = (now.getTime() - lastFetched.getTime()) / (1000 * 60 * 60);

    if (hoursSinceFetch > CACHE_TTL_HOURS) {
      return null; // Cache expired
    }

    return row as GithubProfileCache;
  }

  /**
   * Save or update GitHub profile cache.
   */
  async setCachedProfile(profile: GithubProfileCache): Promise<void> {
    const { error } = await supabase
      .from('github_profiles')
      // @ts-ignore - upsert typing
      .upsert({
        user_id: profile.user_id,
        username: profile.username,
        languages: profile.languages,
        topics: profile.topics,
        repo_names: profile.repo_names,
        last_fetched: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (error) {
      console.error('Error caching GitHub profile:', error);
    }
  }

  /**
   * Get GitHub skill vector with caching.
   * Fetches from cache if within TTL, otherwise fetches from GitHub API.
   */
  async getCachedSkillVector(userId: string, githubUsername: string): Promise<GitHubSkillVector> {
    // Try cache first
    const cached = await this.getCachedProfile(userId);
    if (cached) {
      const languages = (typeof cached.languages === 'object' && cached.languages !== null)
        ? cached.languages as Record<string, number>
        : {};
      const topics = Array.isArray(cached.topics) ? cached.topics : [];
      const repoNames = Array.isArray(cached.repo_names) ? cached.repo_names : [];

      return {
        languages,
        topics,
        repoNames,
        allSkills: [
          ...Object.keys(languages).map(l => l.toLowerCase()),
          ...topics.map(t => t.toLowerCase()),
        ],
      };
    }

    // Fetch fresh data
    const vector = await this.getSkillVector(githubUsername);

    // Cache it
    await this.setCachedProfile({
      user_id: userId,
      username: githubUsername,
      languages: vector.languages,
      topics: vector.topics,
      repo_names: vector.repoNames,
      last_fetched: new Date().toISOString(),
    });

    return vector;
  }
}

export const githubService = new GithubService();
