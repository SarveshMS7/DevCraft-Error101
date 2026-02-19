/**
 * ExploreEmptyState — Empty/no-results/loading states
 *
 * Uses the same empty state design as ProjectsPage:
 *   - bg-muted/10 rounded-xl border border-dashed
 *   - Lucide icon + title + description + CTA
 */

import { SearchX, Compass, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ExploreEmptyStateProps {
    type: 'no-results' | 'empty' | 'error';
    hasFilters: boolean;
    onClearFilters: () => void;
    onRefresh: () => void;
}

export function ExploreEmptyState({ type, hasFilters, onClearFilters, onRefresh }: ExploreEmptyStateProps) {
    const navigate = useNavigate();
    if (type === 'error') {
        return (
            <div className="text-center py-20 bg-destructive/5 rounded-xl border border-dashed border-destructive/20">
                <Loader2 className="w-10 h-10 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Something went wrong</h3>
                <p className="text-muted-foreground mb-4">
                    We couldn't load teams right now.
                </p>
                <Button onClick={onRefresh} variant="outline">
                    Try Again
                </Button>
            </div>
        );
    }

    if (type === 'no-results') {
        return (
            <div className="text-center py-20 bg-muted/10 rounded-xl border border-dashed">
                <SearchX className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No teams found</h3>
                <p className="text-muted-foreground mb-4">
                    {hasFilters
                        ? 'Try adjusting your filters or search query.'
                        : 'No teams are available right now.'}
                </p>
                {hasFilters && (
                    <Button onClick={onClearFilters} variant="outline">
                        Clear Filters
                    </Button>
                )}
            </div>
        );
    }

    // type === 'empty'
    return (
        <div className="text-center py-20 bg-muted/10 rounded-xl border border-dashed">
            <Compass className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No teams yet</h3>
            <p className="text-muted-foreground mb-4">
                Be the first to create a project and build your dream team!
            </p>
            <Button onClick={() => navigate('/projects/new')}>
                Create Project
            </Button>
        </div>
    );
}

/**
 * Skeleton loader grid — shows while initial data loads
 */
export function ExploreSkeletonGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
                <div
                    key={i}
                    className="rounded-xl border bg-card overflow-hidden flex flex-col"
                >
                    {/* Top accent skeleton */}
                    <div className="h-1 w-full bg-muted animate-pulse" />

                    <div className="p-5 space-y-4">
                        {/* Title skeleton */}
                        <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                                <div className="h-5 bg-muted rounded-md w-3/4 animate-pulse" />
                                <div className="flex gap-2">
                                    <div className="h-5 bg-muted rounded-full w-16 animate-pulse" />
                                    <div className="h-5 bg-muted rounded-full w-2 animate-pulse" />
                                </div>
                            </div>
                            <div className="h-12 w-14 bg-muted rounded-lg animate-pulse" />
                        </div>

                        {/* Description skeleton */}
                        <div className="space-y-2">
                            <div className="h-4 bg-muted rounded w-full animate-pulse" />
                            <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
                        </div>

                        {/* Skills skeleton */}
                        <div className="flex gap-2">
                            <div className="h-6 bg-muted rounded-md w-16 animate-pulse" />
                            <div className="h-6 bg-muted rounded-md w-20 animate-pulse" />
                            <div className="h-6 bg-muted rounded-md w-14 animate-pulse" />
                        </div>

                        {/* Meta skeleton */}
                        <div className="flex gap-4">
                            <div className="h-4 bg-muted rounded w-12 animate-pulse" />
                            <div className="h-4 bg-muted rounded w-16 animate-pulse" />
                            <div className="h-4 bg-muted rounded w-10 animate-pulse ml-auto" />
                        </div>
                    </div>

                    {/* Button skeleton */}
                    <div className="px-5 pb-4 mt-auto">
                        <div className="h-10 bg-muted rounded-md w-full animate-pulse" />
                    </div>
                </div>
            ))}
        </div>
    );
}
