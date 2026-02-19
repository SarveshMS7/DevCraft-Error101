
import { supabase } from '@/lib/supabase';

export interface TeamMember {
    id: string;
    username: string;
    avatar: string | null;
    role: string | null;
    skills: string[];
}

export interface TeamWithMembers {
    id: string;
    name: string;
    members: TeamMember[];
}

/**
 * Fetch a team and its members with skills.
 * Avoiding N+1 by using joined query.
 */
export async function getTeamWithMembers(teamId: string): Promise<TeamWithMembers | null> {
    // 1. Fetch team details
    const { data, error: teamError } = await supabase
        .from('projects')
        .select('id, title, owner_id')
        .eq('id', teamId)
        .single();

    const teamData = data as { id: string; title: string; owner_id: string } | null;

    if (teamError) {
        if (teamError.code === 'PGRST116') return null; // Not found
        throw teamError;
    }

    if (!teamData) return null;

    // 2. Fetch members (including owner if they are not in project_members, though usually they should be)
    // We'll query project_members and join profiles
    const { data: membersResponse, error: membersError } = await supabase
        .from('project_members')
        .select(`
      user_id,
      role,
      profiles:user_id (
        id,
        username,
        full_name,
        avatar_url,
        skills,
        role
      )
    `)
        .eq('project_id', teamId);

    const membersData = membersResponse as any[] | null;

    if (membersError) throw membersError;
    if (!membersData) return { id: teamData.id, name: teamData.title, members: [] };

    // 3. Normalize members
    let members: TeamMember[] = membersData.map((m: any) => ({
        id: m.profiles.id,
        username: m.profiles.full_name || m.profiles.username || 'Unknown', // Prefer full_name as username for display
        avatar: m.profiles.avatar_url,
        role: m.role || m.profiles.role || 'Member', // Project role or Profile role
        skills: m.profiles.skills || [],
    }));

    // 4. Ensure owner is included if not present in members list
    // Fetch owner profile if needed
    const ownerInMembers = members.find(m => m.id === teamData.owner_id);
    if (!ownerInMembers) {
        const { data: ownerProfileResponse, error: ownerError } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url, skills, role')
            .eq('id', teamData.owner_id)
            .single();

        const ownerProfile = ownerProfileResponse as any;

        if (!ownerError && ownerProfile) {
            members.unshift({
                id: ownerProfile.id,
                username: ownerProfile.full_name || ownerProfile.username || 'Unknown',
                avatar: ownerProfile.avatar_url,
                role: 'Owner',
                skills: ownerProfile.skills || []
            });
        }
    } else {
        // If owner is in members, ensure their role is displayed as Owner or Leader if appropriate
        members = members.map(m => m.id === teamData.owner_id ? { ...m, role: 'Owner' } : m);
        // Move owner to top
        members.sort((a, b) => (a.id === teamData.owner_id ? -1 : b.id === teamData.owner_id ? 1 : 0));
    }

    return {
        id: teamData.id,
        name: teamData.title,
        members,
    };
}
