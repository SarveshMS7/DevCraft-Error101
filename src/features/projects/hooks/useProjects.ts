import { useEffect, useState } from 'react'
import { projectsApi } from '../api'
import { Project, CreateProjectDTO } from '../types'
import { useToast } from '@/components/ui/use-toast'

export function useProjects(userId?: string) {
    const [projects, setProjects] = useState<Project[]>([])
    const [userProjects, setUserProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()

    useEffect(() => {
        loadProjects()
    }, [userId])

    const loadProjects = async () => {
        try {
            setLoading(true)
            const allData = await projectsApi.getAll()
            setProjects(allData as unknown as Project[])

            if (userId) {
                const userData = await projectsApi.getUserProjects(userId)
                setUserProjects(userData as unknown as Project[])
            }
        } catch (error) {
            toast({
                title: "Error loading projects",
                description: "Please try again later",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    const createProject = async (project: CreateProjectDTO) => {
        try {
            const data = await projectsApi.create(project)
            toast({
                title: "Project created",
                description: "Your project is now live!",
            })
            loadProjects()
            return data
        } catch (error: any) {
            toast({
                title: "Creation failed",
                description: error.message || "Could not create project",
                variant: "destructive"
            })
            throw error
        }
    }

    return { projects, userProjects, loading, refresh: loadProjects, createProject }
}
