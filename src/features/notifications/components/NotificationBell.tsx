/**
 * NotificationBell Component
 *
 * Notification bell icon for the navbar.
 * Shows dropdown with pending project invites.
 */

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import { useInviteNotifications } from '../hooks/useInviteNotifications';
import { Button } from '@/components/ui/button';
import { Bell, Check, X, Loader2, Inbox } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function NotificationBell() {
    const { user } = useAuth();
    const { pendingInvites, pendingCount, loading, acceptInvite, rejectInvite } =
        useInviteNotifications(user?.id);
    const [isOpen, setIsOpen] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    const handleAccept = async (inviteId: string) => {
        setProcessingId(inviteId);
        await acceptInvite(inviteId);
        setProcessingId(null);
    };

    const handleReject = async (inviteId: string) => {
        setProcessingId(inviteId);
        await rejectInvite(inviteId);
        setProcessingId(null);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(prev => !prev)}
                className="relative"
                id="notification-bell"
            >
                <Bell className="w-5 h-5" />
                {/* Badge */}
                <AnimatePresence>
                    {pendingCount > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center"
                        >
                            {pendingCount > 9 ? '9+' : pendingCount}
                        </motion.span>
                    )}
                </AnimatePresence>
            </Button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-80 bg-card border rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-4 py-3 border-b bg-muted/30">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-sm">Notifications</h3>
                                {pendingCount > 0 && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                        {pendingCount} new
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Invite List */}
                        <div className="max-h-[360px] overflow-y-auto">
                            {loading && pendingInvites.length === 0 && (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                </div>
                            )}

                            {!loading && pendingInvites.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
                                    <Inbox className="w-8 h-8 opacity-40" />
                                    <p className="text-sm">No pending invites</p>
                                </div>
                            )}

                            {pendingInvites.map(invite => (
                                <div
                                    key={invite.id}
                                    className="p-3 border-b last:border-b-0 hover:bg-muted/20 transition-colors"
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Sender avatar */}
                                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                                            {(invite.sender?.full_name || invite.sender?.username || 'U')
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm">
                                                <span className="font-semibold">
                                                    {invite.sender?.full_name || invite.sender?.username || 'Someone'}
                                                </span>{' '}
                                                invited you to join
                                            </p>
                                            <p className="text-sm font-medium text-primary truncate">
                                                {invite.project?.title || 'a project'}
                                            </p>
                                            {invite.message && (
                                                <p className="text-xs text-muted-foreground mt-1 italic line-clamp-2">
                                                    &ldquo;{invite.message}&rdquo;
                                                </p>
                                            )}
                                            <p className="text-[10px] text-muted-foreground mt-1">
                                                {new Date(invite.created_at).toLocaleDateString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>

                                            {/* Actions */}
                                            <div className="flex gap-2 mt-2">
                                                <Button
                                                    size="sm"
                                                    className="h-7 text-xs flex-1"
                                                    onClick={() => handleAccept(invite.id)}
                                                    disabled={processingId === invite.id}
                                                >
                                                    {processingId === invite.id ? (
                                                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                    ) : (
                                                        <Check className="w-3 h-3 mr-1" />
                                                    )}
                                                    Accept
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 text-xs flex-1"
                                                    onClick={() => handleReject(invite.id)}
                                                    disabled={processingId === invite.id}
                                                >
                                                    <X className="w-3 h-3 mr-1" />
                                                    Decline
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
