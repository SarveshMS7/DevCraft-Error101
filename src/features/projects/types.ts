import { Database } from '@/types/supabase'

export type Project = Database['public']['Tables']['projects']['Row']
export type CreateProjectDTO = Database['public']['Tables']['projects']['Insert']
export type UpdateProjectDTO = Database['public']['Tables']['projects']['Update']

export type JoinRequest = Database['public']['Tables']['join_requests']['Row']
export type Message = Database['public']['Tables']['messages']['Row']

export interface ProjectWithDetails extends Project {
    owner?: {
        full_name: string | null
        avatar_url: string | null
    }
}
