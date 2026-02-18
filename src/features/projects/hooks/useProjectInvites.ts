/**
 * useProjectInvites Hook
 *
 * Handles sending invites and fetching invite status for a project.
 */

import { useState, useCallback } from 'react';
import { inviteService } from '@/services/invites/service';
import { useToast } from '@/components/ui/use-toast';

interface UseProjectInvitesReturn {
    sendingTo: string | null;
    sentInvites: Set<string>;
    sendInvite: (receiverId: string, message?: string) => Promise<void>;
}

export function useProjectInvites(
    projectId: string | undefined,
    senderId: string | undefined,
    onInviteSent?: () => void
): UseProjectInvitesReturn {
    const [sendingTo, setSendingTo] = useState<string | null>(null);
    const [sentInvites, setSentInvites] = useState<Set<string>>(new Set());
    const { toast } = useToast();

    const sendInvite = useCallback(async (receiverId: string, message?: string) => {
        if (!projectId || !senderId) return;

        setSendingTo(receiverId);
        try {
            await inviteService.sendProjectInvite(projectId, senderId, receiverId, message);
            setSentInvites(prev => new Set(prev).add(receiverId));
            toast({
                title: 'Invite sent!',
                description: 'The user has been invited to your project.',
            });
            onInviteSent?.();
        } catch (err: any) {
            toast({
                title: 'Failed to send invite',
                description: err.message || 'Please try again.',
                variant: 'destructive',
            });
        } finally {
            setSendingTo(null);
        }
    }, [projectId, senderId, toast, onInviteSent]);

    return { sendingTo, sentInvites, sendInvite };
}
