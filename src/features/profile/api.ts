import { supabase } from '@/lib/supabase'
import { UpdateProfileDTO } from './types'

export const profileApi = {
    async getProfile(userId: string) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle()

        if (error) throw error
        return data
    },

    async createProfile(profile: any) {
        const { data, error } = await supabase
            .from('profiles')
            .insert(profile)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async updateProfile(userId: string, updates: UpdateProfileDTO) {
        const { data, error } = await supabase
            .from('profiles')
            // @ts-ignore
            .update(updates)
            .eq('id', userId)
            .select()
            .single()

        if (error) throw error
        return data
    }
}
