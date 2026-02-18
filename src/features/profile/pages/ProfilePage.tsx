import { useState, useEffect } from 'react';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { useAuth } from '@/features/auth/AuthProvider';
import { ProjectCard } from '@/features/projects/components/ProjectCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Github, Globe, Save, X, User, Plus, Clock, MapPin, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { githubService } from '@/services/github/api';
import { useToast } from '@/components/ui/use-toast';

export function ProfilePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { profile, loading: profileLoading, updateProfile } = useProfile();
    const { userProjects, loading: projectsLoading } = useProjects(user?.id);

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        username: '',
        bio: '',
        website: '',
        github_username: '',
        skills: [] as string[],
        availability: '',
        timezone: ''
    });
    const { toast } = useToast();
    const [isSyncing, setIsSyncing] = useState(false);
    const [skillInput, setSkillInput] = useState('');

    useEffect(() => {
        if (profile) {
            setFormData({
                full_name: profile.full_name || '',
                username: profile.username || '',
                bio: profile.bio || '',
                website: profile.website || '',
                github_username: profile.github_username || '',
                skills: profile.skills || [],
                availability: profile.availability || '',
                timezone: profile.timezone || ''
            });
        }
    }, [profile]);

    const handleSave = async () => {
        try {
            await updateProfile(formData);
            setIsEditing(false);
        } catch (error) {
            // Error handled in hook
        }
    };

    const syncGithubSkills = async () => {
        if (!formData.github_username) {
            toast({
                title: "GitHub username required",
                description: "Please enter your GitHub username before syncing.",
                variant: "destructive"
            });
            return;
        }

        setIsSyncing(true);
        try {
            const skillProfile = await githubService.processSkills(formData.github_username);
            const newSkills = skillProfile.skills.map(s => s.name);

            // Merge skills avoiding duplicates
            const mergedSkills = Array.from(new Set([...formData.skills, ...newSkills]));

            setFormData(prev => ({ ...prev, skills: mergedSkills }));

            toast({
                title: "Skills synced!",
                description: `Imported ${newSkills.length} potential skills from GitHub.`,
            });
        } catch (error) {
            toast({
                title: "Sync failed",
                description: "Could not fetch data from GitHub. Please check the username.",
                variant: "destructive"
            });
        } finally {
            setIsSyncing(false);
        }
    };

    const addSkill = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && skillInput.trim()) {
            e.preventDefault();
            if (!formData.skills.includes(skillInput.trim())) {
                setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
            }
            setSkillInput('');
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setFormData({
            ...formData,
            skills: formData.skills.filter(s => s !== skillToRemove)
        });
    };

    const loading = profileLoading || projectsLoading;

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header / Editor */}
            <div className="bg-card rounded-2xl p-8 border shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center text-4xl overflow-hidden border-4 border-background shadow-xl">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt={profile.full_name || 'User'} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-16 h-16 text-muted-foreground" />
                            )}
                        </div>
                    </div>

                    <div className="flex-1 space-y-4 w-full">
                        {!isEditing ? (
                            <>
                                <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4 text-center md:text-left">
                                    <div className="space-y-1">
                                        <h1 className="text-3xl font-bold tracking-tight">{profile?.full_name || 'Set your name'}</h1>
                                        <p className="text-lg text-primary font-medium">@{profile?.username || 'username'}</p>
                                    </div>
                                    <Button variant="outline" onClick={() => setIsEditing(true)}>Edit Profile</Button>
                                </div>
                                <p className="text-muted-foreground max-w-lg text-center md:text-left">{profile?.bio || 'No bio yet. Tell the community about yourself!'}</p>
                                <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2 text-sm">
                                    {profile?.website && (
                                        <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
                                            <Globe className="w-4 h-4 mr-1.5" /> Website
                                        </a>
                                    )}
                                    {profile?.github_username && (
                                        <a href={`https://github.com/${profile.github_username}`} target="_blank" rel="noreferrer" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
                                            <Github className="w-4 h-4 mr-1.5" /> GitHub
                                        </a>
                                    )}
                                    {profile?.availability && (
                                        <div className="flex items-center text-muted-foreground">
                                            <Clock className="w-4 h-4 mr-1.5" /> {profile.availability}
                                        </div>
                                    )}
                                    {profile?.timezone && (
                                        <div className="flex items-center text-muted-foreground">
                                            <MapPin className="w-4 h-4 mr-1.5" /> {profile.timezone}
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="full_name">Full Name</Label>
                                        <Input
                                            id="full_name"
                                            value={formData.full_name}
                                            onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="username">Username</Label>
                                        <Input
                                            id="username"
                                            value={formData.username}
                                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                                            placeholder="johndoe"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <Label htmlFor="bio">Bio</Label>
                                        <textarea
                                            id="bio"
                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={formData.bio}
                                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                            placeholder="Software engineer interested in AI and Web3..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="website">Website URL</Label>
                                        <Input
                                            id="website"
                                            value={formData.website}
                                            onChange={e => setFormData({ ...formData, website: e.target.value })}
                                            placeholder="https://example.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="github">GitHub Username</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="github"
                                                value={formData.github_username}
                                                onChange={e => setFormData({ ...formData, github_username: e.target.value })}
                                                placeholder="ghuser"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={syncGithubSkills}
                                                disabled={isSyncing}
                                                title="Sync skills from GitHub"
                                            >
                                                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="availability">Availability</Label>
                                        <Input
                                            id="availability"
                                            value={formData.availability}
                                            onChange={e => setFormData({ ...formData, availability: e.target.value })}
                                            placeholder="e.g. 10h/week, Weekends"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="timezone">Timezone</Label>
                                        <Input
                                            id="timezone"
                                            value={formData.timezone}
                                            onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                                            placeholder="e.g. UTC+5:30, EST"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <Button variant="ghost" onClick={() => setIsEditing(false)}>
                                        <X className="w-4 h-4 mr-2" /> Cancel
                                    </Button>
                                    <Button onClick={handleSave}>
                                        <Save className="w-4 h-4 mr-2" /> Save Changes
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Skills Column */}
                <div className="md:col-span-1 space-y-4">
                    <div className="bg-card rounded-2xl p-6 border shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Skills</h2>
                        </div>

                        {isEditing && (
                            <div className="space-y-2">
                                <Input
                                    placeholder="Add skill (press Enter)"
                                    value={skillInput}
                                    onChange={e => setSkillInput(e.target.value)}
                                    onKeyDown={addSkill}
                                />
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                            {(isEditing ? formData.skills : (profile?.skills || [])).length > 0 ? (
                                (isEditing ? formData.skills : (profile?.skills || [])).map((skill: string) => (
                                    <span
                                        key={skill}
                                        className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20"
                                    >
                                        {skill}
                                        {isEditing && (
                                            <button onClick={() => removeSkill(skill)} className="ml-2 hover:text-destructive">
                                                <X className="w-3 h-3" />
                                            </button>
                                        )}
                                    </span>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground italic">No skills added yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Projects Column */}
                <div className="md:col-span-2 space-y-4">
                    <div className="bg-card rounded-2xl p-6 border shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">My Projects</h2>
                            <Button size="sm" variant="outline" onClick={() => navigate('/projects/new')}>
                                <Plus className="w-4 h-4 mr-2" /> New Project
                            </Button>
                        </div>

                        {userProjects.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {userProjects.map(project => (
                                    <ProjectCard key={project.id} project={project} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 bg-muted/20 rounded-xl border border-dashed">
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                    <Plus className="w-6 h-6 text-muted-foreground opacity-50" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium">Nothing here yet</p>
                                    <p className="text-sm text-muted-foreground">Projects you create will appear here.</p>
                                </div>
                                <Button size="sm" variant="secondary" onClick={() => navigate('/projects/new')}>
                                    Create your first project
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
