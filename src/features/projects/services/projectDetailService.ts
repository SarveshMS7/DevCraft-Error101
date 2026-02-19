/**
 * ═══════════════════════════════════════════════════════════════
 * Project Detail Service — Supabase Data Layer
 * ═══════════════════════════════════════════════════════════════
 *
 * All Supabase queries for the project detail feature.
 * Services ALWAYS throw on error — hooks catch and show toasts.
 */

import { supabase } from '@/lib/supabase';

/** Message with sender profile info */
export interface ChatMessage {
    id: string;
    created_at: string;
    project_id: string;
    user_id: string;
    content: string;
    profiles?: {
        full_name: string | null;
        avatar_url: string | null;
    } | null;
}

// ─── Messages ─────────────────────────────────────────────────

/** Fetch all messages for a project, with sender profile data */
export async function fetchMessages(projectId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
        .from('messages')
        .select('*, profiles(full_name, avatar_url)')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return (data as any) || [];
}

/** Insert a new message and return it with sender profile data */
export async function insertMessage(
    projectId: string,
    userId: string,
    content: string
): Promise<ChatMessage> {
    const { data, error } = await supabase
        .from('messages')
        .insert({
            project_id: projectId,
            user_id: userId,
            content
        } as any)
        .select('*, profiles(full_name, avatar_url)')
        .single();

    if (error) throw error;
    return data as any as ChatMessage;
}

/** Subscribe to new messages for a project via Supabase Realtime */
export function subscribeToMessages(
    projectId: string,
    onMessage: (msg: ChatMessage) => void
) {
    const channel = supabase
        .channel(`project-chat:${projectId}`)
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `project_id=eq.${projectId}`
        }, (payload) => {
            onMessage(payload.new as any as ChatMessage);
        })
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}

// ─── Join Requests ────────────────────────────────────────────

/** Fetch all join requests for a project, with requester profile data */
export async function fetchJoinRequests(projectId: string) {
    const { data, error } = await supabase
        .from('join_requests')
        .select('*, profiles(full_name, avatar_url)')
        .eq('project_id', projectId);

    if (error) throw error;
    return data || [];
}

/** Submit a new join request */
export async function createJoinRequest(
    projectId: string,
    userId: string,
    message: string
) {
    const { error } = await supabase
        .from('join_requests')
        .insert({
            project_id: projectId,
            user_id: userId,
            message
        } as any);

    if (error) throw error;
}

/** Update join request status (accept/reject) */
export async function updateJoinRequestStatus(
    requestId: string,
    status: 'accepted' | 'rejected'
) {
    const { error } = await supabase
        .from('join_requests')
        // @ts-ignore - Supabase type inference issue with update
        .update({ status })
        .eq('id', requestId);

    if (error) throw error;
}
