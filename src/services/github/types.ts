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
