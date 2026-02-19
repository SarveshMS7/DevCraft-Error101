/**
 * ExploreSearchBar — Search + Sort controls
 *
 * Follows the same pattern used in ProjectsPage:
 *   - Search with icon prefix
 *   - Pill buttons for sort options
 */

import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SORT_OPTIONS, type SortOption } from '@/features/explore-teams/types';

interface ExploreSearchBarProps {
    search: string;
    sort: SortOption;
    onSearchChange: (value: string) => void;
    onSortChange: (sort: SortOption) => void;
    resultCount: number;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    isPersonalized: boolean;
}

export function ExploreSearchBar({
    search,
    sort,
    onSearchChange,
    onSortChange,
    resultCount,
    hasActiveFilters,
    onClearFilters,
    isPersonalized,
}: ExploreSearchBarProps) {
    return (
        <div className="space-y-3">
            {/* Search + Clear Row */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        id="explore-teams-search"
                        placeholder="Search teams by name, skills, or description..."
                        className="pl-9 pr-9"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                    {search && (
                        <button
                            onClick={() => onSearchChange('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
                        onClick={onClearFilters}
                    >
                        <X className="w-3.5 h-3.5 mr-1" />
                        Clear all
                    </Button>
                )}
            </div>

            {/* Sort Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <SlidersHorizontal className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                {SORT_OPTIONS
                    // Show "Best Match" only if personalized
                    .filter((opt) => opt.value !== 'best_match' || isPersonalized)
                    .map((opt) => (
                        <Button
                            key={opt.value}
                            variant={sort === opt.value ? 'default' : 'outline'}
                            size="sm"
                            className="rounded-full shrink-0 text-xs h-7"
                            onClick={() => onSortChange(opt.value)}
                        >
                            {opt.label}
                        </Button>
                    ))}
            </div>

            {/* Result Count */}
            <p className="text-sm text-muted-foreground">
                {resultCount} team{resultCount !== 1 ? 's' : ''} found
                {sort === 'best_match' && isPersonalized && ' · sorted by your match'}
            </p>
        </div>
    );
}
