import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Code2, Cpu, Users } from 'lucide-react';

export function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6 max-w-3xl"
            >
                <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold uppercase tracking-wider">
                    Hackathon Ready
                </span>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    Build Team.<br />Ship Dream.
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    The context-aware matching platform for hackathon teams.
                    We connect developers, designers, and visionaries based on skills, compatibility, and availability.
                </p>

                <div className="flex items-center justify-center gap-4 pt-4">
                    <Button size="lg" className="h-12 px-8 text-lg" onClick={() => navigate('/projects')}>
                        Find a Project <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                    <Button size="lg" variant="outline" className="h-12 px-8 text-lg" onClick={() => navigate('/projects/new')}>
                        Start Building
                    </Button>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl px-4"
            >
                <FeatureCard
                    icon={<Code2 className="w-8 h-8 text-blue-500" />}
                    title="Skill Matching"
                    description="Vector-based matching engine finds the perfect teammates for your tech stack."
                />
                <FeatureCard
                    icon={<Users className="w-8 h-8 text-green-500" />}
                    title="Team Formation"
                    description="Create projects, define roles, and manage join requests in real-time."
                />
                <FeatureCard
                    icon={<Cpu className="w-8 h-8 text-purple-500" />}
                    title="GitHub Verified"
                    description="Import skills directly from your GitHub repositories for verified expertise."
                />
            </motion.div>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="p-6 rounded-2xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center space-y-4">
            <div className="p-3 bg-secondary/50 rounded-xl">
                {icon}
            </div>
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
        </div>
    )
}
