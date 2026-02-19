import { supabase } from '@/lib/supabase'
import { CreateProjectDTO, UpdateProjectDTO } from './types'

export const projectsApi = {
    async getAll() {
        const { data, error } = await supabase
            .from('projects')
            .select('*, profiles(full_name, avatar_url)')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    async getById(id: string) {
        const { data, error } = await supabase
            .from('projects')
            .select('*, profiles(full_name, avatar_url, skills)')
            .eq('id', id)
            .single()

        if (error) throw error
        return data
    },

    async create(project: CreateProjectDTO) {
        // Explicitly build the insert payload with only the columns
        // that exist in the original DB schema (no migrations needed)
        const payload: Record<string, unknown> = {
            title: project.title,
            description: project.description,
            owner_id: project.owner_id,
            required_skills: project.required_skills ?? [],
            status: project.status ?? 'open',
        }

        // These columns require the migration (add_project_columns.sql) to have been run
        if (project.urgency !== undefined) payload.urgency = project.urgency
        if (project.team_size !== undefined) payload.team_size = project.team_size
        if ((project as any).github_url) payload.github_url = (project as any).github_url
        if ((project as any).image_url) payload.image_url = (project as any).image_url

        const { data, error } = await supabase
            .from('projects')
            // @ts-ignore
            .insert(payload)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async update(id: string, updates: UpdateProjectDTO) {
        const { data, error } = await supabase
            .from('projects')
            // @ts-ignore
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async getUserProjects(userId: string) {
        const { data, error } = await supabase
            .from('projects')
            .select('*, profiles(full_name, avatar_url)')
            .eq('owner_id', userId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    }
}
