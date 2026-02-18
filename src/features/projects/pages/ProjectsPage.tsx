import { useEffect } from 'react';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { ProjectCard } from '@/features/projects/components/ProjectCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { calculateCompatibility } from '@/services/matching/compatibility';
import { MatchUser, MatchProject } from '@/services/matching/types';

export function ProjectsPage() {
    const { projects, loading, refresh } = useProjects();
    const { profile } = useProfile();
    const navigate = useNavigate();

    useEffect(() => {
        refresh();
    }, []);

    const projectsWithScores = projects.map(project => {
        if (!profile) return { ...project, matchScore: null };

        const matchUser: MatchUser = {
            id: profile.id,
            skills: profile.skills || [],
            availability: profile.availability || undefined,
            timezone: profile.timezone || undefined
        };

        const matchProject: MatchProject = {
            id: project.id,
            required_skills: project.required_skills || []
        };

        const score = calculateCompatibility(matchUser, matchProject);
        return { ...project, matchScore: score };
    }).sort((a, b) => (b.matchScore?.score || 0) - (a.matchScore?.score || 0));

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Explore Projects</h1>
                    <p className="text-muted-foreground">
                        Find the perfect project that matches your skills and interests.
                    </p>
                </div>
                <Button onClick={() => navigate('/projects/new')}>
                    <Plus className="mr-2 h-4 w-4" /> Create Project
                </Button>
            </div>

            {/* Filters (Placeholder) */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {['All', 'React', 'TypeScript', 'Python', 'AI/ML', 'Design'].map((tag) => (
                    <Button key={tag} variant="outline" size="sm" className="rounded-full">
                        {tag}
                    </Button>
                ))}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-[200px] rounded-lg border bg-muted/20 animate-pulse" />
                    ))}
                </div>
            ) : projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projectsWithScores.map((project, index) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <ProjectCard
                                project={project}
                                matchScore={project.matchScore?.score}
                            />
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-muted/10 rounded-xl border border-dashed">
                    <h3 className="text-lg font-semibold">No projects found</h3>
                    <p className="text-muted-foreground mb-4">Be the first to create one!</p>
                    <Button onClick={() => navigate('/projects/new')}>Create Project</Button>
                </div>
            )}
        </div>
    );
}
