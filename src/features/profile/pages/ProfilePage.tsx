import { useState, useEffect } from 'react';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { useAuth } from '@/features/auth/AuthProvider';
import { ProjectCard } from '@/features/projects/components/ProjectCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SkillBadge } from '@/components/shared/SkillBadge';
import { Github, Globe, Save, X, User, Plus, Clock, MapPin, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { githubService } from '@/services/github/api';
import { useToast } from '@/components/ui/use-toast';

const TIMEZONE_OPTIONS = [
    'UTC-12:00', 'UTC-11:00', 'UTC-10:00', 'UTC-09:00', 'UTC-08:00', 'UTC-07:00',
    'UTC-06:00', 'UTC-05:00', 'UTC-04:00', 'UTC-03:00', 'UTC-02:00', 'UTC-01:00',
    'UTC+00:00', 'UTC+01:00', 'UTC+02:00', 'UTC+03:00', 'UTC+04:00', 'UTC+05:00',
    'UTC+05:30', 'UTC+06:00', 'UTC+07:00', 'UTC+08:00', 'UTC+09:00', 'UTC+10:00',
    'UTC+11:00', 'UTC+12:00',
];

const AVAILABILITY_OPTIONS = [
    { value: 'full-time', label: 'Full-time', description: '40+ hrs/week' },
    { value: 'part-time', label: 'Part-time', description: '10-20 hrs/week' },
    { value: 'weekends', label: 'Weekends', description: 'Weekends only' },
    { value: 'evenings', label: 'Evenings', description: 'After work hours' },
];

export function ProfilePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { profile, loading: profileLoading, updateProfile } = useProfile();
    const { userProjects, loading: projectsLoading } = useProjects(user?.id);
    const { toast } = useToast();

    const [isEditing, setIsEditing] = useState(false);
    const [importingGithub, setImportingGithub] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        username: '',
        bio: '',
        website: '',
        github_username: '',
        skills: [] as string[],
        availability: '',
        timezone: '',
    });
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
                timezone: profile.timezone || '',
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

    const handleImportGithubSkills = async () => {
        const username = formData.github_username || profile?.github_username;
        if (!username) {
            toast({
                title: "No GitHub username",
                description: "Please enter your GitHub username first.",
                variant: "destructive"
            });
            return;
        }

        try {
            setImportingGithub(true);
            const skillProfile = await githubService.processSkills(username);

            const newSkills = skillProfile.skills.map(s => s.name);
            const merged = Array.from(new Set([...formData.skills, ...newSkills]));
            setFormData(prev => ({ ...prev, skills: merged }));

            toast({
                title: "Skills imported!",
                description: `Found ${newSkills.length} skills from ${skillProfile.topLanguages.length} top languages on GitHub.`,
            });
        } catch (error) {
            toast({
                title: "Import failed",
                description: "Could not fetch GitHub data. Check your username.",
                variant: "destructive"
            });
        } finally {
            setImportingGithub(false);
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
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header skeleton */}
            <div className="bg-card rounded-2xl p-8 border shadow-sm">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="w-32 h-32 rounded-full bg-muted animate-pulse" />
                    <div className="flex-1 space-y-4 w-full">
                        <div className="h-7 bg-muted rounded-md w-48 animate-pulse" />
                        <div className="h-4 bg-muted rounded w-32 animate-pulse" />
                        <div className="h-4 bg-muted rounded w-64 animate-pulse" />
                        <div className="flex gap-2">
                            <div className="h-6 bg-muted rounded-full w-16 animate-pulse" />
                            <div className="h-6 bg-muted rounded-full w-20 animate-pulse" />
                            <div className="h-6 bg-muted rounded-full w-14 animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
            {/* Projects skeleton */}
            <div className="bg-card rounded-2xl p-8 border shadow-sm space-y-4">
                <div className="h-6 bg-muted rounded w-32 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map(i => (
                        <div key={i} className="h-[200px] rounded-xl border bg-muted/20 animate-pulse" />
                    ))}
                </div>
            </div>
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
                                        <span className="flex items-center text-muted-foreground">
                                            <Clock className="w-4 h-4 mr-1.5" /> {profile.availability}
                                        </span>
                                    )}
                                    {profile?.timezone && (
                                        <span className="flex items-center text-muted-foreground">
                                            <MapPin className="w-4 h-4 mr-1.5" /> {profile.timezone}
                                        </span>
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
                                        <Input
                                            id="github"
                                            value={formData.github_username}
                                            onChange={e => setFormData({ ...formData, github_username: e.target.value })}
                                            placeholder="ghuser"
                                        />
                                    </div>

                                    {/* Availability */}
                                    <div className="space-y-2">
                                        <Label htmlFor="availability" className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" /> Availability
                                        </Label>
                                        <select
                                            id="availability"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            value={formData.availability}
                                            onChange={e => setFormData({ ...formData, availability: e.target.value })}
                                        >
                                            <option value="">Select availability...</option>
                                            {AVAILABILITY_OPTIONS.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label} ({opt.description})</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Timezone */}
                                    <div className="space-y-2">
                                        <Label htmlFor="timezone" className="flex items-center gap-1.5">
                                            <MapPin className="w-3.5 h-3.5" /> Timezone
                                        </Label>
                                        <select
                                            id="timezone"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            value={formData.timezone}
                                            onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                                        >
                                            <option value="">Select timezone...</option>
                                            {TIMEZONE_OPTIONS.map(tz => (
                                                <option key={tz} value={tz}>{tz}</option>
                                            ))}
                                        </select>
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
                            {(isEditing || profile?.github_username) && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleImportGithubSkills}
                                    disabled={importingGithub}
                                    title="Import skills from GitHub"
                                >
                                    {importingGithub ? (
                                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                    ) : (
                                        <Github className="w-3.5 h-3.5 mr-1.5" />
                                    )}
                                    Import
                                </Button>
                            )}
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
                                    <span key={skill} className="inline-flex items-center">
                                        <SkillBadge skill={skill} size="md" />
                                        {isEditing && (
                                            <button onClick={() => removeSkill(skill)} className="ml-1 hover:text-destructive text-muted-foreground">
                                                <X className="w-3 h-3" />
                                            </button>
                                        )}
                                    </span>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground italic">No skills added yet.</p>
                            )}
                        </div>

                        {!isEditing && profile?.github_username && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={handleImportGithubSkills}
                                disabled={importingGithub}
                            >
                                {importingGithub ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Github className="w-4 h-4 mr-2" />
                                )}
                                Sync from GitHub
                            </Button>
                        )}
                    </div>

                    {/* Availability Card */}
                    {(profile?.availability || profile?.timezone) && !isEditing && (
                        <div className="bg-card rounded-2xl p-6 border shadow-sm space-y-3">
                            <h2 className="text-xl font-semibold">Availability</h2>
                            {profile.availability && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <span className="capitalize">{profile.availability}</span>
                                </div>
                            )}
                            {profile.timezone && (
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                    <span>{profile.timezone}</span>
                                </div>
                            )}
                        </div>
                    )}
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
                                    <ProjectCard key={project.id} project={project as any} />
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
