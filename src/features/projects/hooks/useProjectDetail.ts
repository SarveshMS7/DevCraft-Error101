import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Project, JoinRequest, Message } from '../types';
import { projectsApi } from '../api';
import { useToast } from '@/components/ui/use-toast';

export function useProjectDetail(projectId: string) {
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState<Message[]>([]);
    const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        if (projectId) {
            loadProject();
            loadMessages();
            loadJoinRequests();
            subscribeToMessages();
        }
    }, [projectId]);

    const loadProject = async () => {
        try {
            const data = await projectsApi.getById(projectId);
            setProject(data as any);
        } catch (error) {
            console.error('Error loading project:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async () => {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('project_id', projectId)
                .order('created_at', { ascending: true });

            if (error) console.error('Error loading messages:', error);
            else setMessages(data || []);
        } catch (err) {
            console.error('messages table may not exist yet:', err);
        }
    };

    const loadJoinRequests = async () => {
        const { data, error } = await supabase
            .from('join_requests')
            .select('*, profiles(full_name, avatar_url)')
            .eq('project_id', projectId);

        if (error) console.error('Error loading join requests:', error);
        else setJoinRequests(data || []);
    };

    const subscribeToMessages = () => {
        const channel = supabase
            .channel(`project-chat:${projectId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `project_id=eq.${projectId}`
            }, (payload) => {
                setMessages(prev => [...prev, payload.new as Message]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    const sendMessage = async (userId: string, content: string) => {
        const { error } = await supabase
            .from('messages')
            .insert({
                project_id: projectId,
                user_id: userId,
                content
            } as any);

        if (error) {
            toast({
                title: "Failed to send message",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const submitJoinRequest = async (userId: string, message: string) => {
        const { error } = await supabase
            .from('join_requests')
            .insert({
                project_id: projectId,
                user_id: userId,
                message
            } as any);

        if (error) {
            toast({
                title: "Failed to submit request",
                description: error.message,
                variant: "destructive"
            });
        } else {
            toast({
                title: "Request sent!",
                description: "The project owner will review your request.",
            });
            loadJoinRequests();
        }
    };

    const respondToJoinRequest = async (requestId: string, status: 'accepted' | 'rejected') => {
        const { error } = await supabase
            .from('join_requests')
            // @ts-ignore - Supabase type inference issue with update
            .update({ status })
            .eq('id', requestId);

        if (error) {
            toast({
                title: "Failed to update request",
                description: error.message,
                variant: "destructive"
            });
        } else {
            toast({
                title: `Request ${status}`,
                description: `Successfully ${status} the join request.`,
            });
            loadJoinRequests();
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
        refresh: loadProject
    };
}
