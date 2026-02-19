import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Code2, Cpu, Users, Zap, Github, MessageSquare, Star } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthProvider';

export function LandingPage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div className="flex flex-col items-center justify-center min-h-[85vh] text-center space-y-16">
            {/* Hero */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8 max-w-4xl"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold border border-primary/20"
                >
                    <Zap className="w-3.5 h-3.5" />
                    AI-Powered Team Matching · Now Live
                </motion.div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                    <span className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Build Team.
                    </span>
                    <br />
                    <span className="text-foreground">Ship Dream.</span>
                </h1>

                <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    The context-aware matching platform for hackathon teams.
                    Connect with developers, designers, and visionaries based on
                    <strong className="text-foreground"> verified skills</strong>,
                    <strong className="text-foreground"> compatibility scores</strong>, and
                    <strong className="text-foreground"> availability</strong>.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <Button
                        size="lg"
                        className="h-13 px-8 text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
                        onClick={() => navigate('/projects')}
                    >
                        Explore Projects <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                    {!user ? (
                        <Button
                            size="lg"
                            variant="outline"
                            className="h-13 px-8 text-lg"
                            onClick={() => navigate('/login?tab=register')}
                        >
                            <Github className="mr-2 w-5 h-5" />
                            Join with GitHub
                        </Button>
                    ) : (
                        <Button
                            size="lg"
                            variant="outline"
                            className="h-13 px-8 text-lg"
                            onClick={() => navigate('/projects/new')}
                        >
                            Start Building
                        </Button>
                    )}
                </div>

                {/* Social proof */}
                <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-2">
                    <span className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        Skill-verified profiles
                    </span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                    <span className="flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-blue-500" />
                        Real-time matching
                    </span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                    <span className="flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-green-500" />
                        Built-in team chat
                    </span>
                </div>
            </motion.div>

            {/* Feature Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl px-4"
            >
                <FeatureCard
                    icon={<Code2 className="w-8 h-8 text-blue-500" />}
                    title="GitHub Verified Skills"
                    description="Import skills directly from your GitHub repositories. Our engine extracts languages and topics to build your verified skill profile."
                    badge="Verified"
                    badgeColor="bg-blue-100 text-blue-700"
                />
                <FeatureCard
                    icon={<Cpu className="w-8 h-8 text-purple-500" />}
                    title="Smart Matchmaking"
                    description="Our rule-based engine scores skill overlap, complementary skills, availability, and timezone to find your perfect team."
                    badge="AI-Ready"
                    badgeColor="bg-purple-100 text-purple-700"
                />
                <FeatureCard
                    icon={<Users className="w-8 h-8 text-green-500" />}
                    title="Real-time Collaboration"
                    description="Join projects, send requests, and chat with your team in real-time. Built on Supabase Realtime for instant updates."
                    badge="Live"
                    badgeColor="bg-green-100 text-green-700"
                />
            </motion.div>

            {/* How it works */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="w-full max-w-3xl space-y-4"
            >
                <h2 className="text-2xl font-bold">How it works</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { step: '01', title: 'Build your profile', desc: 'Add skills manually or import from GitHub' },
                        { step: '02', title: 'Browse projects', desc: 'See your match score for every project' },
                        { step: '03', title: 'Join & collaborate', desc: 'Request to join and chat with your team' },
                    ].map(item => (
                        <div key={item.step} className="p-5 rounded-xl bg-muted/30 border text-left space-y-2">
                            <div className="text-3xl font-black text-primary/30">{item.step}</div>
                            <div className="font-semibold">{item.title}</div>
                            <div className="text-sm text-muted-foreground">{item.desc}</div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}

function FeatureCard({
    icon, title, description, badge, badgeColor
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    badge: string;
    badgeColor: string;
}) {
    return (
        <div className="p-6 rounded-2xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center space-y-4">
            <div className="p-3 bg-secondary/50 rounded-xl">
                {icon}
            </div>
            <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeColor}`}>{badge}</span>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
            </div>
        </div>
    )
}
