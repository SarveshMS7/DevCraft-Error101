/**
 * useInviteNotifications Hook
 *
 * Realtime listener for incoming project invites.
 * Powers the notification bell in the navbar.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { inviteService, InviteWithDetails } from '@/services/invites/service';
import { useToast } from '@/components/ui/use-toast';

interface UseInviteNotificationsReturn {
    pendingInvites: InviteWithDetails[];
    loading: boolean;
    pendingCount: number;
    acceptInvite: (inviteId: string) => Promise<void>;
    rejectInvite: (inviteId: string) => Promise<void>;
    refresh: () => Promise<void>;
}

export function useInviteNotifications(userId: string | undefined): UseInviteNotificationsReturn {
    const [pendingInvites, setPendingInvites] = useState<InviteWithDetails[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const fetchInvites = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const all = await inviteService.getReceivedInvites(userId);
            setPendingInvites(all.filter(i => i.status === 'pending'));
        } catch (err) {
            console.error('Failed to fetch invites:', err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // Initial fetch
    useEffect(() => {
        fetchInvites();
    }, [fetchInvites]);

    // Realtime subscription
    useEffect(() => {
        if (!userId) return;

        const channel = supabase
            .channel(`invites:${userId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'project_invites',
                filter: `receiver_id=eq.${userId}`,
            }, (_payload) => {
                // Refetch all invites with details
                fetchInvites();
                toast({
                    title: '🔔 New Project Invite!',
                    description: 'You have received a new project invitation.',
                });
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'project_invites',
                filter: `receiver_id=eq.${userId}`,
            }, () => {
                fetchInvites();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, fetchInvites, toast]);

    const acceptInvite = useCallback(async (inviteId: string) => {
        if (!userId) return;
        try {
            await inviteService.acceptProjectInvite(inviteId, userId);
            toast({
                title: 'Invite accepted!',
                description: 'You have been added to the project team.',
            });
            fetchInvites();
        } catch (err: any) {
            toast({
                title: 'Failed to accept invite',
                description: err.message || 'Please try again.',
                variant: 'destructive',
            });
        }
    }, [userId, toast, fetchInvites]);

    const rejectInvite = useCallback(async (inviteId: string) => {
        if (!userId) return;
        try {
            await inviteService.rejectProjectInvite(inviteId, userId);
            toast({
                title: 'Invite declined',
                description: 'The invite has been declined.',
            });
            fetchInvites();
        } catch (err: any) {
            toast({
                title: 'Failed to decline invite',
                description: err.message || 'Please try again.',
                variant: 'destructive',
            });
        }
    }, [userId, toast, fetchInvites]);

    return {
        pendingInvites,
        loading,
        pendingCount: pendingInvites.length,
        acceptInvite,
        rejectInvite,
        refresh: fetchInvites,
    };
}
