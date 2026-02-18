import { useEffect, useState } from 'react';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { ProjectCard } from '@/features/projects/components/ProjectCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/features/auth/AuthProvider';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { calculateCompatibility } from '@/services/matching/compatibility';

const SKILL_FILTERS = ['All', 'React', 'TypeScript', 'Python', 'AI/ML', 'Design', 'Node.js', 'Rust', 'Go'];
const URGENCY_FILTERS = ['All', 'high', 'medium', 'low'];

export function ProjectsPage() {
    const { projects, loading, refresh } = useProjects();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { profile } = useProfile();

    const [searchQuery, setSearchQuery] = useState('');
    const [activeSkillFilter, setActiveSkillFilter] = useState('All');
    const [activeUrgency, setActiveUrgency] = useState('All');
    const [sortByMatch, setSortByMatch] = useState(false);

    useEffect(() => {
        refresh();
    }, []);

    const getMatchScore = (project: any): number | undefined => {
        if (!profile || !user) return undefined;
        const result = calculateCompatibility(
            { id: profile.id, skills: profile.skills || [] },
            { id: project.id, required_skills: project.required_skills || [] }
        );
        return result.score;
    };

    const filteredProjects = projects
        .filter(p => {
            const matchesSearch = !searchQuery ||
                p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.required_skills?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesSkill = activeSkillFilter === 'All' ||
                p.required_skills?.some(s => s.toLowerCase().includes(activeSkillFilter.toLowerCase()));
            const matchesUrgency = activeUrgency === 'All' || p.urgency === activeUrgency;
            return matchesSearch && matchesSkill && matchesUrgency;
        })
        .map(p => ({ ...p, _matchScore: getMatchScore(p) }))
        .sort((a, b) => {
            if (sortByMatch && a._matchScore !== undefined && b._matchScore !== undefined) {
                return b._matchScore - a._matchScore;
            }
            return 0;
        });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Project Bazaar</h1>
                    <p className="text-muted-foreground mt-1">
                        Find the perfect project that matches your skills and interests.
                    </p>
                </div>
                <Button onClick={() => navigate('/projects/new')} className="shrink-0">
                    <Plus className="mr-2 h-4 w-4" /> Create Project
                </Button>
            </div>

            {/* Search & Filters */}
            <div className="space-y-3">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search projects, skills, or descriptions..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {user && (
                        <Button
                            variant={sortByMatch ? 'default' : 'outline'}
                            onClick={() => setSortByMatch(!sortByMatch)}
                            className="shrink-0"
                            title="Sort by your match score"
                        >
                            <Zap className="w-4 h-4 mr-2" />
                            Best Match
                        </Button>
                    )}
                </div>

                {/* Skill Tags */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {SKILL_FILTERS.map((tag) => (
                        <Button
                            key={tag}
                            variant={activeSkillFilter === tag ? 'default' : 'outline'}
                            size="sm"
                            className="rounded-full shrink-0"
                            onClick={() => setActiveSkillFilter(tag)}
                        >
                            {tag}
                        </Button>
                    ))}
                </div>

                {/* Urgency Filter */}
                <div className="flex gap-2 items-center">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Urgency:</span>
                    {URGENCY_FILTERS.map(u => (
                        <Button
                            key={u}
                            variant={activeUrgency === u ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-7 text-xs rounded-full"
                            onClick={() => setActiveUrgency(u)}
                        >
                            {u === 'All' ? 'All' : u.charAt(0).toUpperCase() + u.slice(1)}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Results count */}
            {!loading && (
                <p className="text-sm text-muted-foreground">
                    {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
                    {sortByMatch && user && ' · sorted by match'}
                </p>
            )}

            {/* Project Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-[280px] rounded-xl border bg-muted/20 animate-pulse" />
                    ))}
                </div>
            ) : filteredProjects.length > 0 ? (
                <AnimatePresence mode="popLayout">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map((project, index) => (
                            <motion.div
                                key={project.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.04, duration: 0.3 }}
                            >
                                <ProjectCard project={project as any} matchScore={project._matchScore} />
                            </motion.div>
                        ))}
                    </div>
                </AnimatePresence>
            ) : (
                <div className="text-center py-20 bg-muted/10 rounded-xl border border-dashed">
                    <h3 className="text-lg font-semibold">No projects found</h3>
                    <p className="text-muted-foreground mb-4">
                        {searchQuery || activeSkillFilter !== 'All' ? 'Try adjusting your filters.' : 'Be the first to create one!'}
                    </p>
                    <Button onClick={() => navigate('/projects/new')}>Create Project</Button>
                </div>
            )}
        </div>
    );
}
