import { GithubRawRepo, ProcessedSkill, UserSkillProfile } from './types';

export class GithubService {
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
}

export const githubService = new GithubService();
