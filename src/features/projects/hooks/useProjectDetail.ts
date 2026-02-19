/**
 * ═══════════════════════════════════════════════════════════════
 * useProjectDetail — Thin state layer over projectDetailService
 * ═══════════════════════════════════════════════════════════════
 *
 * Pattern: Services throw → Hooks catch + toast → Components render.
 * All Supabase access is delegated to projectDetailService.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Project, JoinRequest } from '../types';
import { projectsApi } from '../api';
import { useToast } from '@/components/ui/use-toast';
import {
    ChatMessage,
    fetchMessages,
    insertMessage,
    subscribeToMessages,
    fetchJoinRequests,
    createJoinRequest,
    updateJoinRequestStatus,
} from '../services/projectDetailService';

// Re-export so consumers don't need to import from the service
export type { ChatMessage } from '../services/projectDetailService';

export function useProjectDetail(projectId: string) {
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
    const { toast } = useToast();
    const unsubscribeRef = useRef<(() => void) | null>(null);

    // ─── Data loaders ─────────────────────────────────────────

    const loadProject = useCallback(async () => {
        try {
            const data = await projectsApi.getById(projectId);
            setProject(data as any);
        } catch (error: any) {
            toast({
                title: 'Error loading project',
                description: error.message || 'Please try again later',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }, [projectId, toast]);

    const loadMessages = useCallback(async () => {
        try {
            const data = await fetchMessages(projectId);
            setMessages(data);
        } catch (error: any) {
            console.error('Error loading messages:', error);
        }
    }, [projectId]);

    const loadJoinRequests = useCallback(async () => {
        try {
            const data = await fetchJoinRequests(projectId);
            setJoinRequests(data);
        } catch (error: any) {
            console.error('Error loading join requests:', error);
        }
    }, [projectId]);

    // ─── Initial load ────────────────────────────────────────

    useEffect(() => {
        if (projectId) {
            loadProject();
            loadMessages();
            loadJoinRequests();
        }
    }, [projectId, loadProject, loadMessages, loadJoinRequests]);

    // ─── Realtime subscription (separate effect, proper cleanup) ──

    useEffect(() => {
        if (!projectId) return;

        const unsubscribe = subscribeToMessages(projectId, (newMsg) => {
            setMessages(prev => {
                // Avoid duplicates from optimistic insert
                const exists = prev.some(m => m.id === newMsg.id);
                if (exists) {
                    return prev.map(m => m.id === newMsg.id ? { ...m, ...newMsg } : m);
                }
                return [...prev, newMsg];
            });
        });

        unsubscribeRef.current = unsubscribe;

        return () => {
            unsubscribe();
            unsubscribeRef.current = null;
        };
    }, [projectId]);

    // ─── Actions ─────────────────────────────────────────────

    const sendMessage = async (userId: string, content: string) => {
        // Optimistic insert
        const optimisticId = crypto.randomUUID();
        const optimisticMsg: ChatMessage = {
            id: optimisticId,
            created_at: new Date().toISOString(),
            project_id: projectId,
            user_id: userId,
            content,
            profiles: null,
        };
        setMessages(prev => [...prev, optimisticMsg]);

        try {
            const saved = await insertMessage(projectId, userId, content);
            // Replace optimistic message with real DB data
            setMessages(prev =>
                prev.map(m => m.id === optimisticId ? saved : m)
            );
        } catch (error: any) {
            // Remove optimistic message on failure
            setMessages(prev => prev.filter(m => m.id !== optimisticId));
            toast({
                title: 'Failed to send message',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    const submitJoinRequest = async (userId: string, message: string) => {
        try {
            await createJoinRequest(projectId, userId, message);
            toast({
                title: 'Request sent!',
                description: 'The project owner will review your request.',
            });
            loadJoinRequests();
        } catch (error: any) {
            toast({
                title: 'Failed to submit request',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    const respondToJoinRequest = async (requestId: string, status: 'accepted' | 'rejected') => {
        try {
            await updateJoinRequestStatus(requestId, status);
            toast({
                title: `Request ${status}`,
                description: `Successfully ${status} the join request.`,
            });
            loadJoinRequests();
        } catch (error: any) {
            toast({
                title: 'Failed to update request',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    return {
        project,
        loading,
        messages,
        joinRequests,
        sendMessage,
        submitJoinRequest,
        respondToJoinRequest,
        refresh: loadProject,
    };
}
