export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    updated_at: string | null
                    username: string | null
                    full_name: string | null
                    avatar_url: string | null
                    website: string | null
                    github_username: string | null
                    bio: string | null
                    role: 'developer' | 'designer' | 'manager' | 'other' | null
                    skills: string[] | null
                    availability: string | null
                    timezone: string | null
                }
                Insert: {
                    id: string
                    updated_at?: string | null
                    username?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    website?: string | null
                    github_username?: string | null
                    bio?: string | null
                    role?: 'developer' | 'designer' | 'manager' | 'other' | null
                    skills?: string[] | null
                    availability?: string | null
                    timezone?: string | null
                }
                Update: {
                    id?: string
                    updated_at?: string | null
                    username?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    website?: string | null
                    github_username?: string | null
                    bio?: string | null
                    role?: 'developer' | 'designer' | 'manager' | 'other' | null
                    skills?: string[] | null
                    availability?: string | null
                    timezone?: string | null
                }
            }
            projects: {
                Row: {
                    id: string
                    created_at: string
                    title: string
                    description: string
                    owner_id: string
                    required_skills: string[] | null
                    status: 'open' | 'in_progress' | 'completed' | null
                    urgency: 'low' | 'medium' | 'high' | null
                    team_size: number | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    title: string
                    description: string
                    owner_id: string
                    required_skills?: string[] | null
                    status?: 'open' | 'in_progress' | 'completed' | null
                    urgency?: 'low' | 'medium' | 'high' | null
                    team_size?: number | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    title?: string
                    description?: string
                    owner_id?: string
                    required_skills?: string[] | null
                    status?: 'open' | 'in_progress' | 'completed' | null
                    urgency?: 'low' | 'medium' | 'high' | null
                    team_size?: number | null
                }
            }
            join_requests: {
                Row: {
                    id: string
                    created_at: string
                    project_id: string
                    user_id: string
                    message: string | null
                    status: 'pending' | 'accepted' | 'rejected'
                }
                Insert: {
                    id?: string
                    created_at?: string
                    project_id: string
                    user_id: string
                    message?: string | null
                    status?: 'pending' | 'accepted' | 'rejected'
                }
                Update: {
                    id?: string
                    created_at?: string
                    project_id?: string
                    user_id?: string
                    message?: string | null
                    status?: 'pending' | 'accepted' | 'rejected'
                }
            }
            messages: {
                Row: {
                    id: string
                    created_at: string
                    project_id: string
                    user_id: string
                    content: string
                }
                Insert: {
                    id?: string
                    created_at?: string
                    project_id: string
                    user_id: string
                    content: string
                }
                Update: {
                    id?: string
                    created_at?: string
                    project_id?: string
                    user_id?: string
                    content?: string
                }
            }
        }
    }
}
