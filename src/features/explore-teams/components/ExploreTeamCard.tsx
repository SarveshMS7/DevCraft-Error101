/**
 * ExploreTeamCard — Premium team discovery card
 *
 * Matches the existing ProjectCard design language:
 *   - rounded-xl border bg-card shadow-sm
 *   - hover:shadow-lg hover:-translate-y-0.5
 *   - primary/5 skill badges
 *   - Consistent typography and spacing
 */

import { Users, Clock, ArrowRight, Briefcase, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SkillBadgeList } from '@/components/shared/SkillBadge';
import { MatchScoreBadge } from '@/components/shared/MatchScoreBadge';
import { useNavigate } from 'react-router-dom';
import type { ExploreTeam } from '@/features/explore-teams/types';

interface ExploreTeamCardProps {
    team: ExploreTeam;
    index?: number;
}

const statusConfig = {
    open: { label: 'Open', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    completed: { label: 'Completed', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
};

const urgencyConfig = {
    high: { dot: 'bg-red-500', ring: 'ring-red-500/20' },
    medium: { dot: 'bg-yellow-500', ring: 'ring-yellow-500/20' },
    low: { dot: 'bg-green-500', ring: 'ring-green-500/20' },
};

export function ExploreTeamCard({ team }: ExploreTeamCardProps) {
    const navigate = useNavigate();
    const status = team.status ? statusConfig[team.status] : statusConfig.open;
    const urgency = team.urgency ? urgencyConfig[team.urgency] : null;


    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days}d ago`;
        if (days < 30) return `${Math.floor(days / 7)}w ago`;
        if (days < 365) return `${Math.floor(days / 30)}mo ago`;
        return `${Math.floor(days / 365)}y ago`;
    };

    return (
        <div
            className="group relative rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
            onClick={() => navigate(`/projects/${team.id}`)}
        >
            {/* Top accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-primary/60 via-blue-500/60 to-purple-500/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="flex flex-col space-y-3 p-5 flex-1">
                {/* Header: Title + Match Score */}
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                        <h3 className="text-lg font-bold tracking-tight truncate group-hover:text-primary transition-colors duration-200">
                            {team.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                                {status.label}
                            </span>
                            {urgency && (
                                <span className={`w-2 h-2 rounded-full ${urgency.dot} ring-4 ${urgency.ring}`} />
                            )}
                        </div>
                    </div>

                    {team.match_score !== undefined && (
                        <MatchScoreBadge score={team.match_score} size="lg" />
                    )}
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {team.description}
                </p>

                {/* Skills */}
                <SkillBadgeList
                    skills={team.required_skills}
                    matchedSkills={team.matched_skills}
                    maxVisible={4}
                />

                {/* Metadata Row */}
                {/* Metadata Row - flexible height, wraps if needed */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground pt-1 min-h-[1.75rem]">
                    {team.members && team.members.length > 0 ? (
                        <div className="flex items-center -space-x-2 mr-1 shrink-0">
                            {team.members.slice(0, 3).map((m, i) => (
                                <div key={i} className="relative group/avatar" title={`${m.username} • ${m.skills?.join(', ') || ''}`}>
                                    <Avatar className="h-6 w-6 border rounded-full ring-2 ring-background hover:z-10 hover:ring-primary/20 transition-all shrink-0">
                                        <AvatarImage src={m.avatar_url || ''} />
                                        <AvatarFallback className="text-[8px] bg-muted flex items-center justify-center w-full h-full">
                                            {m.username?.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                            ))}
                            {team.member_count > 3 && (
                                <div className="h-6 w-6 rounded-full bg-muted border ring-2 ring-background flex items-center justify-center text-[9px] font-medium z-0 shrink-0" title={`+${team.member_count - 3} more`}>
                                    +{team.member_count - 3}
                                </div>
                            )}
                        </div>
                    ) : (
                        <span className="flex items-center gap-1 shrink-0">
                            <Users className="w-3.5 h-3.5" />
                            {team.member_count}/{team.team_size || '?'}
                        </span>
                    )}

                    {team.open_roles > 0 && (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                            <Briefcase className="w-3.5 h-3.5" />
                            {team.open_roles} open
                        </span>
                    )}

                    <span className="flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        {team.activity_score}
                    </span>

                    <span className="flex items-center gap-1 ml-auto">
                        <Clock className="w-3.5 h-3.5" />
                        {timeAgo(team.created_at)}
                    </span>
                </div>

                {/* Owner */}
                {team.owner?.full_name && (
                    <div className="flex items-center gap-2 pt-1">
                        {team.owner.avatar_url ? (
                            <img
                                src={team.owner.avatar_url}
                                alt={team.owner.full_name}
                                className="w-5 h-5 rounded-full ring-1 ring-border"
                            />
                        ) : (
                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                {team.owner.full_name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <span className="text-xs text-muted-foreground truncate">
                            by {team.owner.full_name}
                        </span>
                    </div>
                )}
            </div>

            {/* Action */}
            <div className="px-5 pb-4 mt-auto">
                <Button
                    variant="default"
                    className="w-full shadow-sm group-hover:bg-primary/90 transition-colors"
                    onClick={(e) => { e.stopPropagation(); navigate(`/projects/${team.id}`); }}
                >
                    View Team <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    );
}
