/**
 * ═══════════════════════════════════════════════════════════════
 * SkillBadge — Shared skill tag component
 * ═══════════════════════════════════════════════════════════════
 *
 * Replaces 4+ duplicated skill badge patterns across the codebase.
 *
 * Variants:
 *   - default:  primary/5 bg with primary text (standard)
 *   - matched:  emerald bg with Zap icon (skill matches)
 *   - outline:  secondary bg with border (detail page)
 *
 * Sizes:
 *   - sm: compact cards
 *   - md: detail pages
 */

import { Zap } from 'lucide-react';

type SkillBadgeVariant = 'default' | 'matched' | 'outline';
type SkillBadgeSize = 'sm' | 'md';

interface SkillBadgeProps {
    skill: string;
    variant?: SkillBadgeVariant;
    size?: SkillBadgeSize;
    className?: string;
}

const variantClasses: Record<SkillBadgeVariant, string> = {
    default: 'border-primary/20 bg-primary/5 text-primary',
    matched: 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
    outline: 'bg-secondary text-secondary-foreground border',
};

const sizeClasses: Record<SkillBadgeSize, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
};

export function SkillBadge({
    skill,
    variant = 'default',
    size = 'sm',
    className = '',
}: SkillBadgeProps) {
    return (
        <span
            className={`inline-flex items-center rounded-md border font-medium transition-colors ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        >
            {variant === 'matched' && <Zap className="w-3 h-3 mr-0.5" />}
            {skill}
        </span>
    );
}

/**
 * Renders a list of skills with overflow indicator.
 */
interface SkillBadgeListProps {
    skills: string[];
    matchedSkills?: string[];
    variant?: SkillBadgeVariant;
    size?: SkillBadgeSize;
    maxVisible?: number;
    className?: string;
}

export function SkillBadgeList({
    skills,
    matchedSkills,
    variant = 'default',
    size = 'sm',
    maxVisible = 4,
    className = '',
}: SkillBadgeListProps) {
    const visible = skills.slice(0, maxVisible);
    const overflow = skills.length - maxVisible;

    return (
        <div className={`flex flex-wrap gap-1.5 ${className}`}>
            {visible.map((skill) => (
                <SkillBadge
                    key={skill}
                    skill={skill}
                    variant={matchedSkills?.includes(skill) ? 'matched' : variant}
                    size={size}
                />
            ))}
            {overflow > 0 && (
                <span className="text-xs text-muted-foreground px-1 py-0.5">
                    +{overflow} more
                </span>
            )}
        </div>
    );
}
