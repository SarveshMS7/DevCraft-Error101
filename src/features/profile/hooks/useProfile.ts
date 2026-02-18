import { useEffect, useState } from 'react'
import { profileApi } from '../api'
import { Profile } from '../types'
import { useAuth } from '@/features/auth/AuthProvider'
import { useToast } from '@/components/ui/use-toast'

export function useProfile() {
    const { user } = useAuth()
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()

    useEffect(() => {
        if (user) {
            loadProfile()
        }
    }, [user])

    const loadProfile = async () => {
        if (!user) return
        try {
            let data = await profileApi.getProfile(user.id)

            if (!data) {
                // If profile doesn't exist, create a basic one
                const newProfile = {
                    id: user.id,
                    username: user.email?.split('@')[0] || `user_${user.id.slice(0, 5)}`,
                    full_name: user.user_metadata?.full_name || '',
                    avatar_url: user.user_metadata?.avatar_url || '',
                    skills: []
                }
                data = await profileApi.createProfile(newProfile)
            }

            setProfile(data)
        } catch (error: any) {
            console.error('Profile loading/creation error:', error)
            toast({
                title: "Error loading profile",
                description: error.message || "Please try again later",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    const updateProfile = async (updates: any) => {
        if (!user) return
        try {
            const data = await profileApi.updateProfile(user.id, updates)
            setProfile(data)
            toast({
                title: "Profile updated",
                description: "Your changes have been saved successfully.",
            })
            return data
        } catch (error: any) {
            toast({
                title: "Update failed",
                description: error.message || "Could not update profile",
                variant: "destructive"
            })
            throw error
        }
    }

    return { profile, loading, refresh: loadProfile, updateProfile }
}
