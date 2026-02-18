export interface MatchUser {
    id: string;
    skills: string[];
    availability?: string;
    timezone?: string;
}

export interface MatchProject {
    id: string;
    required_skills: string[];
    availability_required?: string;
}

export interface MatchScoreDetails {
    skillOverlap: number;
    complementaryScore: number;
    availabilityScore: number;
    missingSkills: string[];
}

export interface MatchScore {
    projectId: string;
    score: number; // 0-100
    details: MatchScoreDetails;
}
