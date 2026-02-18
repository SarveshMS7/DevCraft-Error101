export interface GithubRawRepo {
    name: string;
    description: string;
    language: string;
    stargazers_count: number;
    html_url: string;
    topics?: string[];
}

export interface ProcessedSkill {
    name: string;
    source: 'github_language' | 'github_topic' | 'manual';
    confidenceScore: number; // 0-1
    lastUsed?: string;
}

export interface UserSkillProfile {
    username: string;
    skills: ProcessedSkill[];
    topLanguages: string[];
}

/** Cached GitHub profile stored in Supabase */
export interface GithubProfileCache {
    user_id: string;
    username: string;
    languages: Record<string, number>;
    topics: string[];
    repo_names: string[];
    last_fetched: string;
}

/** Structured skill vector derived from GitHub data */
export interface GitHubSkillVector {
    languages: Record<string, number>;  // language -> count
    topics: string[];
    repoNames: string[];
    allSkills: string[];                 // normalized union of languages + topics
}
