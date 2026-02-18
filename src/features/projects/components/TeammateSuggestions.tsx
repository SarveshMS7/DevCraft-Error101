/**
 * TeammateSuggestions Component
 *
 * Renders a panel of AI-matched teammate suggestions for a project.
 * Shows user cards with match score, skills, and invite button.
 */

import { useState } from 'react';
import { useTeammateSuggestions } from '../hooks/useTeammateSuggestions';
import { useProjectInvites } from '../hooks/useProjectInvites';
import { SuggestedTeammate } from '@/services/suggestions/service';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    UserPlus,
    RefreshCw,
    Github,
    Sparkles,
    CheckCircle2,
    Loader2,
    ChevronDown,
    ChevronUp,
    X,
    Send,
    Trophy,
    Target,
    Star,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TeammateSuggestionsProps {
    projectId: string;
    ownerId: string;
    currentUserId?: string;
}

export function TeammateSuggestions({ projectId, ownerId, currentUserId }: TeammateSuggestionsProps) {
    const { suggestions, loading, error, refresh } = useTeammateSuggestions(projectId);
    const { sendingTo, sentInvites, sendInvite } = useProjectInvites(projectId, currentUserId, refresh);

    const [expandedUser, setExpandedUser] = useState<string | null>(null);
    const [inviteMessage, setInviteMessage] = useState('');
    const [showMessageFor, setShowMessageFor] = useState<string | null>(null);

    // Only the project owner should see this panel
    if (currentUserId !== ownerId) return null;

    const handleInvite = async (userId: string) => {
        await sendInvite(userId, inviteMessage || undefined);
        setShowMessageFor(null);
        setInviteMessage('');
    };

    const getScoreColor = (score: number) => {
        if (score >= 75) return 'text-emerald-400';
        if (score >= 50) return 'text-amber-400';
        if (score >= 25) return 'text-orange-400';
        return 'text-slate-400';
    };

    const getScoreBg = (score: number) => {
        if (score >= 75) return 'from-emerald-500/20 to-emerald-600/5';
        if (score >= 50) return 'from-amber-500/20 to-amber-600/5';
        if (score >= 25) return 'from-orange-500/20 to-orange-600/5';
        return 'from-slate-500/20 to-slate-600/5';
    };

    const getLabelIcon = (label: string) => {
        if (label === 'Excellent') return <Trophy className="w-3.5 h-3.5" />;
        if (label === 'Good') return <Star className="w-3.5 h-3.5" />;
        return <Target className="w-3.5 h-3.5" />;
    };

    return (
        <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-base">Suggested Teammates</h3>
                            <p className="text-xs text-muted-foreground">
                                AI-matched based on skills & GitHub activity
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={refresh}
                        disabled={loading}
                        className="h-8 w-8"
                        title="Refresh suggestions"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                {loading && suggestions.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-primary/60" />
                        <p className="text-sm text-muted-foreground">Analyzing candidates...</p>
                    </div>
                )}

                {error && (
                    <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm text-center">
                        {error}
                    </div>
                )}

                {!loading && !error && suggestions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">No matching candidates found.</p>
                        <p className="text-xs mt-1 opacity-70">Try adjusting your project skills.</p>
                    </div>
                )}

                <AnimatePresence mode="popLayout">
                    {suggestions.map((suggestion, index) => (
                        <SuggestionCard
                            key={suggestion.userId}
                            suggestion={suggestion}
                            index={index}
                            isExpanded={expandedUser === suggestion.userId}
                            onToggleExpand={() =>
                                setExpandedUser(prev =>
                                    prev === suggestion.userId ? null : suggestion.userId
                                )
                            }
                            isSending={sendingTo === suggestion.userId}
                            isSent={sentInvites.has(suggestion.userId)}
                            showMessage={showMessageFor === suggestion.userId}
                            inviteMessage={inviteMessage}
                            onMessageChange={setInviteMessage}
                            onShowMessage={() => {
                                setShowMessageFor(suggestion.userId);
                                setInviteMessage('');
                            }}
                            onCancelMessage={() => setShowMessageFor(null)}
                            onInvite={() => handleInvite(suggestion.userId)}
                            getScoreColor={getScoreColor}
                            getScoreBg={getScoreBg}
                            getLabelIcon={getLabelIcon}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {/* Footer */}
            {suggestions.length > 0 && (
                <div className="p-3 border-t bg-muted/20">
                    <p className="text-[10px] text-muted-foreground text-center">
                        Showing top {suggestions.length} candidates • Scores based on skill match & GitHub data
                    </p>
                </div>
            )}
        </div>
    );
}

// ─── Suggestion Card ──────────────────────────────────────────
interface SuggestionCardProps {
    suggestion: SuggestedTeammate;
    index: number;
    isExpanded: boolean;
    onToggleExpand: () => void;
    isSending: boolean;
    isSent: boolean;
    showMessage: boolean;
    inviteMessage: string;
    onMessageChange: (msg: string) => void;
    onShowMessage: () => void;
    onCancelMessage: () => void;
    onInvite: () => void;
    getScoreColor: (score: number) => string;
    getScoreBg: (score: number) => string;
    getLabelIcon: (label: string) => React.ReactNode;
}

function SuggestionCard({
    suggestion,
    index,
    isExpanded,
    onToggleExpand,
    isSending,
    isSent,
    showMessage,
    inviteMessage,
    onMessageChange,
    onCancelMessage,
    onInvite,
    onShowMessage,
    getScoreColor,
    getScoreBg,
    getLabelIcon,
}: SuggestionCardProps) {
    const { profile, score, matchedSkills, label, confidence, details } = suggestion;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className="rounded-xl border bg-card/50 hover:bg-card transition-colors overflow-hidden"
        >
            {/* Main Row */}
            <div className="p-3.5">
                <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                        {profile.avatar_url ? (
                            <img
                                src={profile.avatar_url}
                                alt={profile.full_name || 'User'}
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-border"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary ring-2 ring-border">
                                {(profile.full_name || profile.username || 'U').charAt(0).toUpperCase()}
                            </div>
                        )}
                        {/* Rank badge for top 3 */}
                        {index < 3 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                                {index + 1}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm truncate">
                                {profile.full_name || profile.username || 'Unknown User'}
                            </h4>
                            {profile.github_username && (
                                <a
                                    href={`https://github.com/${profile.github_username}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                    onClick={e => e.stopPropagation()}
                                    title={`@${profile.github_username}`}
                                >
                                    <Github className="w-3.5 h-3.5" />
                                </a>
                            )}
                        </div>
                        {profile.role && (
                            <span className="text-[11px] text-muted-foreground capitalize">
                                {profile.role}
                            </span>
                        )}

                        {/* Matched skills badges */}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                            {matchedSkills.slice(0, 4).map(skill => (
                                <span
                                    key={skill}
                                    className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                >
                                    ✓ {skill}
                                </span>
                            ))}
                            {matchedSkills.length > 4 && (
                                <span className="text-[10px] text-muted-foreground px-1 py-0.5">
                                    +{matchedSkills.length - 4}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Score & Actions */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        {/* Score */}
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r ${getScoreBg(score)}`}>
                            <span className={`text-lg font-bold ${getScoreColor(score)}`}>
                                {score}%
                            </span>
                        </div>

                        <div className={`flex items-center gap-1 text-[10px] font-medium ${getScoreColor(score)}`}>
                            {getLabelIcon(label)}
                            {label}
                        </div>
                    </div>
                </div>

                {/* Actions Row */}
                <div className="flex items-center gap-2 mt-3">
                    {isSent ? (
                        <Button
                            size="sm"
                            variant="outline"
                            disabled
                            className="flex-1 h-8 text-xs"
                        >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                            Invited
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            variant="default"
                            className="flex-1 h-8 text-xs"
                            onClick={onShowMessage}
                            disabled={isSending}
                        >
                            {isSending ? (
                                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                            ) : (
                                <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                            )}
                            Invite
                        </Button>
                    )}
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={onToggleExpand}
                    >
                        {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                        ) : (
                            <ChevronDown className="w-4 h-4" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Invite message input */}
            <AnimatePresence>
                {showMessage && !isSent && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-3.5 pb-3 space-y-2">
                            <Textarea
                                placeholder="Add a personal message (optional)..."
                                value={inviteMessage}
                                onChange={e => onMessageChange(e.target.value)}
                                className="min-h-[60px] text-xs resize-none"
                            />
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    className="flex-1 h-7 text-xs"
                                    onClick={onInvite}
                                    disabled={isSending}
                                >
                                    {isSending ? (
                                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                    ) : (
                                        <Send className="w-3 h-3 mr-1" />
                                    )}
                                    Send Invite
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0"
                                    onClick={onCancelMessage}
                                >
                                    <X className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Expanded Details */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-3.5 pb-3.5 pt-1 border-t space-y-3">
                            {/* Score Breakdown */}
                            <div className="space-y-2">
                                <h5 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                    Score Breakdown
                                </h5>
                                <div className="space-y-1.5">
                                    <ScoreBar label="Skill Match" value={details.skillOverlapScore} />
                                    <ScoreBar label="GitHub Languages" value={details.githubLanguageScore} />
                                    <ScoreBar label="Repo Relevance" value={details.repoRelevanceScore} />
                                    <ScoreBar label="Complementary" value={details.complementaryScore} />
                                </div>
                            </div>

                            {/* Missing Skills */}
                            {details.missingSkills.length > 0 && (
                                <div>
                                    <h5 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                        Missing Skills
                                    </h5>
                                    <div className="flex flex-wrap gap-1">
                                        {details.missingSkills.map(skill => (
                                            <span
                                                key={skill}
                                                className="px-1.5 py-0.5 rounded text-[10px] bg-orange-500/10 text-orange-600 border border-orange-500/20"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Confidence */}
                            <div className="text-[10px] text-muted-foreground">
                                Confidence: {Math.round(confidence * 100)}%
                                {!profile.github_username && (
                                    <span className="ml-2 opacity-70">
                                        (No GitHub linked)
                                    </span>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ─── Score Bar ─────────────────────────────────────────────────
function ScoreBar({ label, value }: { label: string; value: number }) {
    const barColor =
        value >= 75 ? 'bg-emerald-500' :
            value >= 50 ? 'bg-amber-500' :
                value >= 25 ? 'bg-orange-500' :
                    'bg-slate-400';

    return (
        <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground w-24 truncate">{label}</span>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                    className={`h-full rounded-full ${barColor}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                />
            </div>
            <span className="text-[10px] font-medium w-8 text-right">{value}%</span>
        </div>
    );
}
