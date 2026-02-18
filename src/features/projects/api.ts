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
            .select('*, profiles(full_name, avatar_url)')
            .eq('id', id)
            .single()

        if (error) throw error
        return data
    },

    async create(project: CreateProjectDTO) {
        const { data, error } = await supabase
            .from('projects')
            // @ts-ignore
            .insert(project)
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
