import { Project } from '../types'
import { Button } from '@/components/ui/button'
import { SkillBadgeList } from '@/components/shared/SkillBadge'
import { MatchScoreBadge } from '@/components/shared/MatchScoreBadge'
import { Github, Users, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface ProjectCardProps {
    project: Project & {
        github_url?: string | null;
        image_url?: string | null;
        profiles?: { full_name: string | null; avatar_url: string | null }
    }
    matchScore?: number
}

const urgencyConfig = {
    high: { label: 'High Urgency', color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800', dot: 'bg-red-500' },
    medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800', dot: 'bg-yellow-500' },
    low: { label: 'Low Priority', color: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800', dot: 'bg-green-500' },
}

const statusConfig = {
    open: { label: 'Open', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    completed: { label: 'Completed', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
}

export function ProjectCard({ project, matchScore }: ProjectCardProps) {
    const navigate = useNavigate()
    const urgency = project.urgency ? urgencyConfig[project.urgency] : null
    const status = project.status ? statusConfig[project.status] : statusConfig.open

    return (
        <div
            className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer group"
            onClick={() => navigate(`/projects/${project.id}`)}
        >
            {project.image_url && (
                <div className="w-full h-40 overflow-hidden border-b">
                    <img
                        src={project.image_url}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                    />
                </div>
            )}

            <div className="flex flex-col space-y-3 p-5 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 flex-1 min-w-0">
                        <h3 className="text-lg font-bold tracking-tight truncate group-hover:text-primary transition-colors">{project.title}</h3>
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                                {status.label}
                            </span>
                            {urgency && (
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium border flex items-center gap-1 ${urgency.color}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${urgency.dot}`} />
                                    {urgency.label}
                                </span>
                            )}
                        </div>
                    </div>
                    {matchScore !== undefined && (
                        <MatchScoreBadge score={matchScore} size="sm" />
                    )}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {project.description}
                </p>

                <SkillBadgeList skills={project.required_skills || []} maxVisible={4} />

                <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                    {project.team_size && (
                        <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" /> {project.team_size} members
                        </span>
                    )}
                    {project.profiles?.full_name && (
                        <span className="truncate">by {project.profiles.full_name}</span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 px-5 pb-4 mt-auto">
                <Button
                    variant="default"
                    className="flex-1 shadow-sm group-hover:bg-primary/90 transition-colors"
                    onClick={(e) => { e.stopPropagation(); navigate(`/projects/${project.id}`) }}
                >
                    View Details <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                {(project as any).github_url && (
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); window.open((project as any).github_url, '_blank') }}
                        title="View on GitHub"
                    >
                        <Github className="w-4 h-4" />
                    </Button>
                )}
            </div>
        </div>
    )
}
