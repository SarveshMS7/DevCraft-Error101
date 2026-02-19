/**
 * ═══════════════════════════════════════════════════════════════
 * EmptyState — Shared empty/error state component
 * ═══════════════════════════════════════════════════════════════
 *
 * A reusable empty state component for lists, search results,
 * and error fallbacks. Supports icon, title, description, and action.
 */

import { LucideIcon, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export function EmptyState({
    icon: Icon = Inbox,
    title,
    description,
    actionLabel,
    onAction,
    className = '',
}: EmptyStateProps) {
    return (
        <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold mb-1">{title}</h3>
            {description && (
                <p className="text-sm text-muted-foreground max-w-md mb-4 leading-relaxed">
                    {description}
                </p>
            )}
            {actionLabel && onAction && (
                <Button variant="outline" onClick={onAction}>
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
