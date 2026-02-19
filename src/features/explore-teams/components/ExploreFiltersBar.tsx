/**
 * ExploreFiltersBar — Filter controls for skills, status, domain
 *
 * Uses the same pill-button pattern used for skill/urgency filters
 * in ProjectsPage. Keeps visual consistency.
 */

import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    STATUS_OPTIONS,
    DOMAIN_OPTIONS,
    type StatusFilter,
    type DomainFilter,
} from '@/features/explore-teams/types';

const SKILL_TAGS = [
    'React', 'TypeScript', 'Python', 'Node.js', 'AI/ML',
    'Design', 'Rust', 'Go', 'Java', 'Docker', 'Solidity',
    'Flutter', 'Swift',
];

interface ExploreFiltersBarProps {
    activeSkills: string[];
    activeStatus: StatusFilter;
    activeDomain: DomainFilter;
    onToggleSkill: (skill: string) => void;
    onStatusChange: (status: StatusFilter) => void;
    onDomainChange: (domain: DomainFilter) => void;
}

export function ExploreFiltersBar({
    activeSkills,
    activeStatus,
    activeDomain,
    onToggleSkill,
    onStatusChange,
    onDomainChange,
}: ExploreFiltersBarProps) {
    return (
        <div className="space-y-3">
            {/* Skill Tags */}
            <div className="flex items-start gap-2">
                <div className="flex items-center gap-1.5 pt-0.5 text-xs text-muted-foreground font-medium uppercase tracking-wider shrink-0">
                    <Filter className="w-3.5 h-3.5" />
                    Skills
                </div>
                <div className="flex gap-1.5 flex-wrap">
                    {SKILL_TAGS.map((skill) => (
                        <Button
                            key={skill}
                            variant={activeSkills.includes(skill) ? 'default' : 'outline'}
                            size="sm"
                            className="rounded-full shrink-0 text-xs h-7"
                            onClick={() => onToggleSkill(skill)}
                        >
                            {skill}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Status + Domain Row */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Status Filter */}
                <div className="flex gap-2 items-center">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Status:</span>
                    {STATUS_OPTIONS.map((s) => (
                        <Button
                            key={s}
                            variant={activeStatus === s ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-7 text-xs rounded-full"
                            onClick={() => onStatusChange(s)}
                        >
                            {s === 'All' ? 'All' : s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
                        </Button>
                    ))}
                </div>

                {/* Domain Filter */}
                <div className="flex gap-2 items-center overflow-x-auto scrollbar-hide">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider shrink-0">Domain:</span>
                    {DOMAIN_OPTIONS.map((d) => (
                        <Button
                            key={d}
                            variant={activeDomain === d ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-7 text-xs rounded-full shrink-0"
                            onClick={() => onDomainChange(d)}
                        >
                            {d}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
}
