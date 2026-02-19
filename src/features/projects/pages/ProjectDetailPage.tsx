import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthProvider';
import { useProjectDetail } from '../hooks/useProjectDetail';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    MessageSquare,
    UserPlus,
    ArrowLeft,
    Calendar,
    Users,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Clock,
    Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateCompatibility } from '@/services/matching/compatibility';
import { SkillBadge } from '@/components/shared/SkillBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { TeammateSuggestions } from '../components/TeammateSuggestions';

export function ProjectDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { project, loading, messages, joinRequests, sendMessage, submitJoinRequest, respondToJoinRequest } = useProjectDetail(id!);
    const { profile } = useProfile();

    const [chatMessage, setChatMessage] = useState('');
    const [joinMessage, setJoinMessage] = useState('');
    const [showJoinModal, setShowJoinModal] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (loading) return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            <div className="h-9 bg-muted rounded w-32 animate-pulse" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-card rounded-2xl p-8 border shadow-sm space-y-6">
                        <div className="h-10 bg-muted rounded w-3/4 animate-pulse" />
                        <div className="flex gap-4">
                            <div className="h-4 bg-muted rounded w-24 animate-pulse" />
                            <div className="h-4 bg-muted rounded w-32 animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 bg-muted rounded w-full animate-pulse" />
                            <div className="h-4 bg-muted rounded w-5/6 animate-pulse" />
                            <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
                        </div>
                        <div className="flex gap-2">
                            <div className="h-7 bg-muted rounded-full w-16 animate-pulse" />
                            <div className="h-7 bg-muted rounded-full w-20 animate-pulse" />
                            <div className="h-7 bg-muted rounded-full w-14 animate-pulse" />
                        </div>
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="bg-card rounded-2xl p-6 border shadow-sm h-[200px] animate-pulse" />
                    <div className="bg-card rounded-2xl p-6 border shadow-sm h-[300px] animate-pulse" />
                </div>
            </div>
        </div>
    );

    if (!project) return (
        <EmptyState
            icon={AlertCircle}
            title="Project not found"
            description="This project may have been removed or you may not have access."
            actionLabel="Browse Projects"
            onAction={() => navigate('/projects')}
        />
    );

    const isOwner = user?.id === project.owner_id;
    const isMember = isOwner || joinRequests.some(r => r.user_id === user?.id && r.status === 'accepted');
    const hasPendingRequest = joinRequests.some(r => r.user_id === user?.id && r.status === 'pending');

    const matchScore = profile ? calculateCompatibility(
        { id: profile.id, skills: profile.skills || [] },
        { id: project.id, required_skills: project.required_skills || [] }
    ) : null;

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatMessage.trim() || !user) return;
        sendMessage(user.id, chatMessage);
        setChatMessage('');
    };

    const handleJoinSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        submitJoinRequest(user.id, joinMessage);
        setShowJoinModal(false);
        setJoinMessage('');
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
            <Button variant="ghost" onClick={() => navigate('/projects')} className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Bazaar
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Project Info */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-card rounded-2xl p-8 border shadow-sm space-y-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-start">
                                <h1 className="text-4xl font-bold tracking-tight">{project.title}</h1>
                                {matchScore && (
                                    <div className="flex flex-col items-end">
                                        <div className="text-2xl font-bold text-primary">{matchScore.score}%</div>
                                        <div className="text-xs text-muted-foreground font-medium uppercase">Compatibility</div>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-1.5" />
                                    {project.urgency ? `Urgency: ${project.urgency}` : 'Normal Priority'}
                                </div>
                                <div className="flex items-center">
                                    <Users className="w-4 h-4 mr-1.5" />
                                    Team Size: {project.team_size || 2}
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-1.5" />
                                    Created {new Date(project.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        <div className="prose prose-slate max-w-none">
                            <p className="text-lg leading-relaxed text-muted-foreground whitespace-pre-wrap">
                                {project.description}
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-semibold text-lg">Required Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {project.required_skills?.map(skill => (
                                    <SkillBadge key={skill} skill={skill} variant="outline" size="md" />
                                ))}
                            </div>
                        </div>

                        {!isMember && !hasPendingRequest && (
                            <Button size="lg" className="w-full md:w-auto" onClick={() => setShowJoinModal(true)}>
                                <UserPlus className="w-5 h-5 mr-2" /> Request to Join
                            </Button>
                        )}

                        {hasPendingRequest && (
                            <Button size="lg" variant="outline" disabled className="w-full md:w-auto">
                                <Clock className="w-5 h-5 mr-2" /> Request Pending
                            </Button>
                        )}

                        {isMember && !isOwner && (
                            <div className="p-4 bg-emerald-500/10 text-emerald-600 rounded-xl border border-emerald-500/20 flex items-center">
                                <CheckCircle2 className="w-5 h-5 mr-3" />
                                You are a member of this project!
                            </div>
                        )}
                    </div>

                    {/* Chat Section */}
                    {(isMember) && (
                        <div className="bg-card rounded-2xl border shadow-sm flex flex-col h-[500px]">
                            <div className="p-4 border-b flex items-center justify-between bg-muted/30">
                                <h3 className="font-semibold flex items-center">
                                    <MessageSquare className="w-4 h-4 mr-2" /> Project Channel
                                </h3>
                                <span className="text-xs text-muted-foreground">{messages.length} messages</span>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50 italic">
                                        <p>No messages yet. Start the conversation!</p>
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => {
                                        const isOwn = msg.user_id === user?.id;
                                        const senderName = (msg as any).profiles?.full_name || 'Unknown';
                                        // Show sender label if it's not own message and different from prev
                                        const showSender = !isOwn && (
                                            idx === 0 || messages[idx - 1].user_id !== msg.user_id
                                        );
                                        return (
                                            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                                {!isOwn && (
                                                    <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0 mt-1">
                                                        {senderName.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="flex flex-col max-w-[75%]">
                                                    {showSender && (
                                                        <span className="text-[10px] text-muted-foreground mb-0.5 px-1 font-medium">
                                                            {senderName}
                                                        </span>
                                                    )}
                                                    <div className={`p-3 rounded-2xl ${isOwn
                                                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                                                        : 'bg-muted rounded-tl-sm'
                                                        }`}>
                                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                                    </div>
                                                    <span className={`text-[10px] text-muted-foreground mt-0.5 px-1 ${isOwn ? 'text-right' : ''}`}>
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <form onSubmit={handleSendMessage} className="p-4 border-t bg-muted/10">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Type a message..."
                                        value={chatMessage}
                                        onChange={(e) => setChatMessage(e.target.value)}
                                        className="flex-1 bg-background"
                                    />
                                    <Button type="submit" size="icon">
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* Right Column: Teammates & Owner Actions */}
                <div className="space-y-8">
                    {/* Join Requests (Owner only) */}
                    {isOwner && joinRequests.length > 0 && (
                        <div className="bg-card rounded-2xl p-6 border shadow-sm space-y-4">
                            <h3 className="font-semibold text-lg flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 text-primary" /> Join Requests
                            </h3>
                            <div className="space-y-4">
                                {joinRequests.filter(r => r.status === 'pending').map((request: any) => (
                                    <div key={request.id} className="p-4 border rounded-xl space-y-3 bg-muted/20">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold">
                                                {request.profiles?.full_name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{request.profiles?.full_name || 'Anonymous'}</p>
                                                <p className="text-xs text-muted-foreground">Wants to join</p>
                                            </div>
                                        </div>
                                        {request.message && (
                                            <p className="text-sm italic bg-background p-2 rounded border">{request.message}</p>
                                        )}
                                        <div className="flex gap-2">
                                            <Button size="sm" className="flex-1" onClick={() => respondToJoinRequest(request.id, 'accepted')}>
                                                Accept
                                            </Button>
                                            <Button size="sm" variant="outline" className="flex-1" onClick={() => respondToJoinRequest(request.id, 'rejected')}>
                                                Decline
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {joinRequests.filter(r => r.status === 'pending').length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-4">No pending requests</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Skills Gap (Placeholder) */}
                    <div className="bg-card rounded-2xl p-6 border shadow-sm space-y-4">
                        <h3 className="font-semibold text-lg">Skill Gap Visualization</h3>
                        <div className="space-y-3">
                            {project.required_skills?.map(skill => {
                                const filled = joinRequests.some(r => r.status === 'accepted' && (r as any).profiles?.skills?.includes(skill));
                                const isUserSkill = profile?.skills?.includes(skill);

                                return (
                                    <div key={skill} className="space-y-1">
                                        <div className="flex justify-between text-xs font-medium">
                                            <span>{skill}</span>
                                            <span className={filled || (isUserSkill && isMember) ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-600 dark:text-orange-400'}>
                                                {filled || (isUserSkill && isMember) ? 'FILLED' : 'NEEDED'}
                                            </span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                            <div className={`h-full transition-all duration-1000 ${filled || (isUserSkill && isMember) ? 'w-full bg-green-500' : 'w-1/4 bg-orange-400'
                                                }`} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-4 italic">
                            * Placeholder: AI-driven gap analysis coming soon.
                        </p>
                    </div>

                    {/* Teammate Suggestions (Owner only) */}
                    {isOwner && (
                        <TeammateSuggestions
                            projectId={project.id}
                            ownerId={project.owner_id}
                            currentUserId={user?.id}
                        />
                    )}
                </div>
            </div>

            {/* Join Request Modal */}
            <AnimatePresence>
                {showJoinModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-card border shadow-2xl rounded-2xl w-full max-w-md p-6 space-y-6"
                        >
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold">Join {project.title}</h2>
                                <Button variant="ghost" size="icon" onClick={() => setShowJoinModal(false)}>
                                    <XCircle className="w-6 h-6" />
                                </Button>
                            </div>

                            <form onSubmit={handleJoinSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="message">Introduction / Pitch</Label>
                                    <Textarea
                                        id="message"
                                        placeholder="Why do you want to join? What can you contribute?"
                                        className="min-h-[120px]"
                                        value={joinMessage}
                                        onChange={(e) => setJoinMessage(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="pt-2">
                                    <Button type="submit" className="w-full">
                                        Submit Request
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
