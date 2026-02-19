import { useNavigate } from "react-router-dom";
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/features/landing-page/components/ui/hover-card';
import { motion } from 'framer-motion';

import {
    ArrowRight,
    Code2,
    Users,
    Zap,
    CheckCircle2,
    Sparkles,
    MessageSquare,
} from 'lucide-react';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
            delayChildren: 0.3,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
            ease: 'easeOut',
        },
    },
};

const featureCardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: 'easeOut' },
    },
    hover: {
        y: -10,
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)',
        transition: { duration: 0.3 },
    },
};

export default function LandingPage() {
    const navigate = useNavigate();
    

    return (
        <div className="min-h-screen bg-white text-black overflow-hidden">

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center px-6 sm:px-8 lg:px-10  overflow-hidden">
                {/* Animated Background Orbs */}
                <motion.div
                    className="absolute top-20 right-10 w-72 h-72 bg-black/5 rounded-full blur-3xl"
                    animate={{ y: [0, 50, 0], x: [0, 30, 0] }}
                    transition={{ duration: 8, repeat: Infinity }}
                />
                <motion.div
                    className="absolute bottom-20 left-10 w-72 h-72 bg-black/5 rounded-full blur-3xl"
                    animate={{ y: [0, -50, 0], x: [0, -30, 0] }}
                    transition={{ duration: 10, repeat: Infinity }}
                />

                <motion.div
                    className="max-w-5xl mx-auto text-center relative z-10 space-y-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Badge */}
                    <motion.div
                        variants={itemVariants}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/5 text-black border border-black/20 hover:border-black/40 transition-all duration-300"
                        whileHover={{ scale: 1.05, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
                    >
                        <motion.span animate={{ rotate: [0, 360] }} transition={{ duration: 2, repeat: Infinity }}>
                            <Sparkles className="w-4 h-4" />
                        </motion.span>
                        <span className="text-sm font-medium">Intelligent Team Matching</span>
                    </motion.div>

                    {/* Heading */}
                    <motion.h1
                        variants={itemVariants}
                        className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-tight"
                    >
                        <motion.span
                            className="inline-block bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent"
                            animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                            transition={{ duration: 8, repeat: Infinity }}
                        >
                            Build Teams
                        </motion.span>
                        <br className="hidden sm:block" />
                        <span className="text-black">in Minutes</span>
                    </motion.h1>


                    {/* Subheading */}
                    <motion.p
                        variants={itemVariants}
                        className="text-lg sm:text-xl text-black/60 max-w-3xl mx-auto leading-relaxed"
                    >
                        Connect with developers, designers, and founders using verified skills. Our AI-powered matching algorithm finds your perfect collaborators for hackathons and startups based on <span className="text-black font-semibold">compatibility</span>, <span className="text-black font-semibold">availability</span>, and <span className="text-black font-semibold">skills</span>.
                    </motion.p>
                    {/* CTA Buttons */}
                    <motion.div
                        variants={itemVariants}
                        className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4"
                    >
                        {/* Explore Projects Button */}
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                onClick={() => navigate('/projects')}
                                className="h-13 px-10 text-base font-semibold gap-2 bg-black text-white hover:bg-black/80"
                            >
                                Explore Projects
                                <ArrowRight className="w-5 h-5" />
                            </Button>
                        </motion.div>
                    </motion.div>

                    {/* Social Proof */}
                    <motion.div
                        variants={itemVariants}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-black/60 pt-12 border-t border-black/10"
                    >
                        {[
                            { icon: CheckCircle2, label: '500+ Verified Users', value: '500+' },
                            { icon: Zap, label: '98% Match Success', value: '98%' },
                            { icon: Users, label: '24/7 Live Support', value: '24/7' },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                className="flex items-center justify-center gap-2"
                                whileHover={{ scale: 1.05 }}
                            >
                                <stat.icon className="w-5 h-5 text-black flex-shrink-0" />
                                <span><span className="text-black font-semibold">{stat.value}</span> {stat.label.split(' ').slice(1).join(' ')}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section id="features" className="relative py-24 px-6 sm:px-8 lg:px-10 bg-gradient-to-b from-gray-50 via-white to-white border-y border-black/10">
                <div className="max-w-7xl mx-auto space-y-16">
                    {/* Section Header */}
                    <motion.div
                        className="text-center space-y-4 max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-black">
                            Why Choose CollabSphere?
                        </h2>
                        <p className="text-black/60 text-lg leading-relaxed">
                            Engineered for teams that demand excellence. Connect smarter, collaborate faster, build better.
                        </p>
                    </motion.div>

                    {/* Feature Cards */}
                    <motion.div
                        className="grid md:grid-cols-3 gap-8"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {[
                            { icon: Code2, title: 'Verified Skills', description: 'GitHub integration for real project proof', badge: 'Smart Match' },
                            { icon: Zap, title: 'AI Matchmaking', description: 'Algorithm suggests compatible teams', badge: 'Fast & Accurate' },
                            { icon: MessageSquare, title: 'Real-time Chat', description: 'Instant communication to finalize teams', badge: 'Built-in' },
                        ].map((feature, i) => (
                            <HoverCard key={i}>
                                <HoverCardTrigger asChild>
                                    <motion.div
                                        variants={featureCardVariants}
                                        whileHover="hover"
                                        className={`
                        p-8 rounded-2xl border transition-all duration-300 
                        hover:shadow-2xl hover:scale-[1.02]
                        cursor-pointer group

                        ${feature.title === 'Verified Skills' &&
                                            'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-blue-200/40'}

                        ${feature.title === 'AI Matchmaking' &&
                                            'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-purple-200/40'}

                        ${feature.title === 'Real-time Chat' &&
                                            'bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-green-200/40'}
                    `}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div
                                                className={`
                                p-4 rounded-xl transition-all duration-300

                                ${feature.title === 'Verified Skills' &&
                                                    'bg-blue-200 group-hover:bg-blue-300'}

                                ${feature.title === 'AI Matchmaking' &&
                                                    'bg-purple-200 group-hover:bg-purple-300'}

                                ${feature.title === 'Real-time Chat' &&
                                                    'bg-green-200 group-hover:bg-green-300'}
                            `}
                                            >
                                                <feature.icon className="w-6 h-6 text-black" />
                                            </div>

                                            <span
                                                className={`
                                text-xs font-bold px-3 py-1 rounded-full

                                ${feature.title === 'Verified Skills' &&
                                                    'bg-blue-200 text-blue-800'}

                                ${feature.title === 'AI Matchmaking' &&
                                                    'bg-purple-200 text-purple-800'}

                                ${feature.title === 'Real-time Chat' &&
                                                    'bg-green-200 text-green-800'}
                            `}
                                            >
                                                {feature.badge}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-black mb-2">
                                            {feature.title}
                                        </h3>

                                        <p className="text-black/70 text-sm">
                                            {feature.description}
                                        </p>

                                        <motion.div
                                            className="flex items-center gap-2 text-black text-sm font-semibold mt-4 pt-4 border-t border-black/20"
                                            whileHover={{ x: 4 }}
                                        >
                                            Learn more <ArrowRight className="w-4 h-4" />
                                        </motion.div>
                                    </motion.div>
                                </HoverCardTrigger>

                                <HoverCardContent className="w-64 bg-white border border-black/10 shadow-xl rounded-xl">
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-semibold">
                                            {feature.title}
                                        </h4>
                                        <p className="text-sm text-black/70">
                                            {feature.title === 'Verified Skills' && 'Connect your GitHub to showcase real projects and verified technical skills.'}
                                            {feature.title === 'AI Matchmaking' && 'Our algorithm analyzes skills, availability, and interests to create perfect teams.'}
                                            {feature.title === 'Real-time Chat' && 'Chat directly with matched collaborators to negotiate roles and responsibilities.'}
                                        </p>
                                    </div>
                                </HoverCardContent>
                            </HoverCard>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="relative py-24 px-6 sm:px-8 lg:px-10 bg-white">
                <div className="max-w-7xl mx-auto space-y-16">
                    {/* Section Header */}
                    <motion.div
                        className="text-center space-y-4 max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-black">
                            Get Started in Three Steps
                        </h2>
                        <p className="text-black/60 text-lg">
                            From zero to dream team in minutes. Here's how CollabSphere works.
                        </p>
                    </motion.div>

                    {/* Steps */}
                    <motion.div
                        className="grid md:grid-cols-3 gap-8"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {[
                            { step: '01', title: 'Create Profile', description: 'Sign up and link your GitHub to verify your skills' },
                            { step: '02', title: 'Find Match', description: 'Get AI-powered suggestions based on your preferences' },
                            { step: '03', title: 'Build Together', description: 'Chat, negotiate, and ship your next big project' },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                variants={featureCardVariants}
                                whileHover="hover"
                                className={`
                p-8 rounded-2xl border transition-all duration-300 
                hover:shadow-2xl hover:scale-[1.02]
                group

                ${i === 0 &&
                                    'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-orange-200/40'}

                ${i === 1 &&
                                    'bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200 hover:shadow-cyan-200/40'}

                ${i === 2 &&
                                    'bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200 hover:shadow-pink-200/40'}
            `}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div
                                        className={`
                        p-4 rounded-xl transition-all duration-300

                        ${i === 0 && 'bg-orange-200 group-hover:bg-orange-300'}
                        ${i === 1 && 'bg-cyan-200 group-hover:bg-cyan-300'}
                        ${i === 2 && 'bg-pink-200 group-hover:bg-pink-300'}
                    `}
                                    >
                                        {i === 0 && <Code2 className="w-6 h-6 text-black" />}
                                        {i === 1 && <Zap className="w-6 h-6 text-black" />}
                                        {i === 2 && <Users className="w-6 h-6 text-black" />}
                                    </div>

                                    <span
                                        className={`
                        text-3xl font-black

                        ${i === 0 && 'text-orange-200'}
                        ${i === 1 && 'text-cyan-200'}
                        ${i === 2 && 'text-pink-200'}
                    `}
                                    >
                                        {item.step}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-black mb-2">
                                    {item.title}
                                </h3>

                                <p className="text-black/70 text-sm">
                                    {item.description}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-24 px-6 sm:px-8 lg:px-10 bg-white">
                <motion.div
                    className="max-w-4xl mx-auto text-center space-y-10 py-20 px-8 rounded-3xl border border-black/20 bg-gradient-to-b from-black/5 via-white to-transparent relative overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 border border-black/20"
                    >
                        <Sparkles className="w-4 h-4 text-black animate-pulse" />
                        <span className="text-sm font-semibold text-black">Ready to build something amazing?</span>
                    </motion.div>

                    <div className="space-y-4">
                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-black">
                            Join Your Dream Team Today
                        </h2>
                        <p className="text-lg text-black/60 max-w-2xl mx-auto leading-relaxed">
                            Stop searching. Start building. Thousands of talented creators are waiting to collaborate with you.
                        </p>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}
