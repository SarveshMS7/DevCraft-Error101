/**
 * Project Invite Service
 *
 * Handles sending, accepting, and rejecting project invites.
 * All operations go through Supabase with proper error handling.
 */

import { supabase } from '@/lib/supabase';

export interface ProjectInvite {
    id: string;
    project_id: string;
    sender_id: string;
    receiver_id: string;
    message: string | null;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
}

export interface InviteWithDetails extends ProjectInvite {
    project?: {
        title: string;
        description: string;
        owner_id: string;
    };
    sender?: {
        full_name: string | null;
        avatar_url: string | null;
        username: string | null;
    };
    receiver?: {
        full_name: string | null;
        avatar_url: string | null;
        username: string | null;
    };
}

export const inviteService = {
    /**
     * Send a project invite from the owner to a user.
     */
    async sendProjectInvite(
        projectId: string,
        senderId: string,
        receiverId: string,
        message?: string
    ): Promise<ProjectInvite> {
        // Check for existing invite to prevent duplicates
        // @ts-ignore - project_invites table
        const { data: rawExisting } = await supabase
            .from('project_invites')
            .select('id, status')
            .eq('project_id', projectId)
            .eq('receiver_id', receiverId)
            .maybeSingle();

        const existing = rawExisting as any;

        if (existing) {
            if (existing.status === 'pending') {
                throw new Error('An invite has already been sent to this user.');
            }
            if (existing.status === 'accepted') {
                throw new Error('This user has already accepted an invite.');
            }
            // If rejected, allow re-inviting by updating
            if (existing.status === 'rejected') {
                // @ts-ignore
                const { data, error } = await supabase
                    .from('project_invites')
                    // @ts-ignore
                    .update({ status: 'pending', message, sender_id: senderId })
                    .eq('id', existing.id)
                    .select()
                    .single();

                if (error) throw error;
                return data as unknown as ProjectInvite;
            }
        }

        const payload = {
            project_id: projectId,
            sender_id: senderId,
            receiver_id: receiverId,
            message: message || null,
            status: 'pending',
        };

        // @ts-ignore
        const { data, error } = await supabase
            .from('project_invites')
            // @ts-ignore
            .insert(payload)
            .select()
            .single();

        if (error) throw error;
        return data as unknown as ProjectInvite;
    },

    /**
     * Accept a project invite.
     * Updates status to 'accepted' and adds user to project_members.
     */
    async acceptProjectInvite(inviteId: string, userId: string): Promise<void> {
        // Fetch the invite
        // @ts-ignore
        const { data: rawInvite, error: fetchError } = await supabase
            .from('project_invites')
            .select('*')
            .eq('id', inviteId)
            .eq('receiver_id', userId)
            .single();

        const invite = rawInvite as any;

        if (fetchError || !invite) {
            throw new Error('Invite not found or you are not the recipient.');
        }

        if (invite.status !== 'pending') {
            throw new Error(`Cannot accept invite with status: ${invite.status}`);
        }

        // Update invite status
        // @ts-ignore
        const { error: updateError } = await supabase
            .from('project_invites')
            // @ts-ignore
            .update({ status: 'accepted' })
            .eq('id', inviteId);

        if (updateError) throw updateError;

        // Add to project_members (prevent duplicates)
        // @ts-ignore
        const { data: existingMember } = await supabase
            .from('project_members')
            .select('id')
            .eq('project_id', invite.project_id)
            .eq('user_id', userId)
            .maybeSingle();

        if (!existingMember) {
            // @ts-ignore
            const { error: memberError } = await supabase
                .from('project_members')
                // @ts-ignore
                .insert({
                    project_id: invite.project_id,
                    user_id: userId,
                    role: 'member',
                });

            if (memberError) {
                console.error('Error adding member:', memberError);
                throw memberError;
            }
        }
    },

    /**
     * Reject a project invite.
     */
    async rejectProjectInvite(inviteId: string, userId: string): Promise<void> {
        // @ts-ignore
        const { error } = await supabase
            .from('project_invites')
            // @ts-ignore
            .update({ status: 'rejected' })
            .eq('id', inviteId)
            .eq('receiver_id', userId);

        if (error) throw error;
    },

    /**
     * Get all invites received by a user (with project and sender details).
     */
    async getReceivedInvites(userId: string): Promise<InviteWithDetails[]> {
        // @ts-ignore
        const { data, error } = await supabase
            .from('project_invites')
            .select(`
                *,
                project:projects(title, description, owner_id),
                sender:profiles!project_invites_sender_id_fkey(full_name, avatar_url, username)
            `)
            .eq('receiver_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []) as unknown as InviteWithDetails[];
    },

    /**
     * Get pending invites for a specific project.
     */
    async getProjectInvites(projectId: string): Promise<InviteWithDetails[]> {
        // @ts-ignore
        const { data, error } = await supabase
            .from('project_invites')
            .select(`
                *,
                receiver:profiles!project_invites_receiver_id_fkey(full_name, avatar_url, username)
            `)
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []) as unknown as InviteWithDetails[];
    },

    /**
     * Get all members of a project.
     */
    async getProjectMembers(projectId: string) {
        // @ts-ignore
        const { data, error } = await supabase
            .from('project_members')
            .select(`
                *,
                user:profiles(id, full_name, avatar_url, username, skills, github_username)
            `)
            .eq('project_id', projectId);

        if (error) throw error;
        return data || [];
    },
};
