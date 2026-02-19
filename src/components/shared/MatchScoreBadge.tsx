/**
 * ═══════════════════════════════════════════════════════════════
 * MatchScoreBadge — Shared match score display
 * ═══════════════════════════════════════════════════════════════
 *
 * Replaces 3+ duplicated match score patterns across ProjectCard,
 * ExploreTeamCard, and TeammateSuggestions.
 *
 * Sizes:
 *   - sm: compact inline badge (cards)
 *   - lg: prominent badge with background (detail views)
 */

type MatchScoreSize = 'sm' | 'lg';

interface MatchScoreBadgeProps {
    score: number;
    size?: MatchScoreSize;
    className?: string;
}

function getScoreColor(score: number) {
    if (score >= 75) return {
        text: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800',
    };
    if (score >= 50) return {
        text: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
    };
    if (score >= 25) return {
        text: 'text-yellow-600 dark:text-yellow-400',
        bg: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
    };
    return {
        text: 'text-muted-foreground',
        bg: 'bg-muted/50 border-border',
    };
}

export function MatchScoreBadge({ score, size = 'sm', className = '' }: MatchScoreBadgeProps) {
    const colors = getScoreColor(score);

    if (size === 'lg') {
        return (
            <div className={`flex-shrink-0 flex flex-col items-center p-2 rounded-lg border ${colors.bg} ${className}`}>
                <div className={`text-xl font-bold leading-none ${colors.text}`}>
                    {score}%
                </div>
                <div className="text-[9px] text-muted-foreground uppercase tracking-widest mt-0.5">
                    Match
                </div>
            </div>
        );
    }

    return (
        <div className={`flex-shrink-0 flex flex-col items-center ${className}`}>
            <div className={`text-lg font-bold ${colors.text}`}>
                {score}%
            </div>
            <div className="text-[9px] text-muted-foreground uppercase tracking-wider">
                Match
            </div>
        </div>
    );
}

/**
 * Horizontal score bar — used in detail views and suggestion cards.
 */
interface ScoreBarProps {
    score: number;
    label?: string;
    className?: string;
}

export function ScoreBar({ score, label, className = '' }: ScoreBarProps) {
    const colors = getScoreColor(score);

    return (
        <div className={`space-y-1 ${className}`}>
            {label && (
                <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{label}</span>
                    <span className={`font-semibold ${colors.text}`}>{score}%</span>
                </div>
            )}
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${score >= 75 ? 'bg-emerald-500' : score >= 50 ? 'bg-blue-500' : score >= 25 ? 'bg-yellow-500' : 'bg-muted-foreground/30'}`}
                    style={{ width: `${Math.min(score, 100)}%` }}
                />
            </div>
        </div>
    );
}

export { getScoreColor };
