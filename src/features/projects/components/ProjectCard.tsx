import { Project } from '../types'
import { Button } from '@/components/ui/button'
import { Github } from 'lucide-react'

interface ProjectCardProps {
    project: Project & { github_url?: string | null; image_url?: string | null; profiles?: { full_name: string | null; avatar_url: string | null } }
    matchScore?: number | null
}

export function ProjectCard({ project, matchScore }: ProjectCardProps) {
    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
            {project.image_url && (
                <div className="w-full h-48 overflow-hidden border-b">
                    <img
                        src={project.image_url}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                    />
                </div>
            )}

            <div className="flex flex-col space-y-3 p-6 flex-1">
                <div className="space-y-1">
                    <h3 className="text-xl font-bold tracking-tight">{project.title}</h3>
                    <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium uppercase tracking-wider ${project.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                            {project.status}
                        </span>
                        {matchScore !== undefined && matchScore !== null && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${matchScore > 80 ? 'bg-indigo-100 text-indigo-700' :
                                matchScore > 50 ? 'bg-orange-100 text-orange-700' :
                                    'bg-slate-100 text-slate-700'
                                }`}>
                                {matchScore}% Match
                            </span>
                        )}
                    </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {project.description}
                </p>

                <div className="flex flex-wrap gap-2">
                    {project.required_skills?.map((skill) => (
                        <span
                            key={skill}
                            className="inline-flex items-center rounded-md border border-primary/20 bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary"
                        >
                            {skill}
                        </span>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-2 p-6 pt-0 mt-auto">
                <Button variant="default" className="flex-1 shadow-sm">
                    View Details
                </Button>
                {project.github_url && (
                    <Button variant="outline" size="icon" asChild title="View on GitHub">
                        <a href={project.github_url} target="_blank" rel="noreferrer">
                            <Github className="w-4 h-4" />
                        </a>
                    </Button>
                )}
            </div>
        </div>
    )
}
