import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthProvider';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Rocket, ArrowLeft, X } from 'lucide-react';

export function CreateProjectPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { createProject } = useProjects();
    const { toast } = useToast();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        required_skills: [] as string[],
        github_url: '',
        image_url: '',
        urgency: 'medium' as 'low' | 'medium' | 'high',
        team_size: 2,
    });
    const [skillInput, setSkillInput] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (!formData.title || !formData.description) {
            toast({
                title: "Validation Error",
                description: "Title and Description are required",
                variant: "destructive"
            });
            return;
        }

        try {
            setLoading(true);
            await createProject({
                title: formData.title,
                description: formData.description,
                required_skills: formData.required_skills,
                github_url: formData.github_url || null,
                image_url: formData.image_url || null,
                urgency: formData.urgency,
                team_size: formData.team_size,
                owner_id: user.id,
                status: 'open'
            });
            navigate('/projects');
        } catch (error) {
            // Error handheld by hook
        } finally {
            setLoading(false);
        }
    };

    const addSkill = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && skillInput.trim()) {
            e.preventDefault();
            if (!formData.required_skills.includes(skillInput.trim())) {
                setFormData({
                    ...formData,
                    required_skills: [...formData.required_skills, skillInput.trim()]
                });
            }
            setSkillInput('');
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setFormData({
            ...formData,
            required_skills: formData.required_skills.filter(s => s !== skillToRemove)
        });
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="hover:bg-secondary"
            >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>

            <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">Launch a New Project</h1>
                <p className="text-muted-foreground text-lg">
                    Define your vision and find the perfect teammates to help you build it.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-card p-8 rounded-2xl border shadow-lg">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Project Title</Label>
                        <Input
                            id="title"
                            placeholder="e.g. AI-Powered Task Manager"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="text-lg h-12"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Detailed Description</Label>
                        <textarea
                            id="description"
                            className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="What problem are you solving? What is the core technology? Minimum contribution expected?"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="github_url">GitHub Repository (Optional)</Label>
                            <Input
                                id="github_url"
                                placeholder="https://github.com/user/repo"
                                value={formData.github_url}
                                onChange={e => setFormData({ ...formData, github_url: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="image_url">Screenshot URL (Optional)</Label>
                            <Input
                                id="image_url"
                                placeholder="https://example.com/image.png"
                                value={formData.image_url}
                                onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="urgency">Urgency</Label>
                            <select
                                id="urgency"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={formData.urgency}
                                onChange={e => setFormData({ ...formData, urgency: e.target.value as any })}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="team_size">Desired Team Size</Label>
                            <Input
                                id="team_size"
                                type="number"
                                min="1"
                                max="50"
                                value={formData.team_size}
                                onChange={e => setFormData({ ...formData, team_size: parseInt(e.target.value) || 2 })}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label>Required Skills / Roles</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {formData.required_skills.map(skill => (
                                <span key={skill} className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20">
                                    {skill}
                                    <button type="button" onClick={() => removeSkill(skill)} className="ml-2 hover:text-destructive">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Add skill (e.g. React, UX Design) and press Enter"
                                value={skillInput}
                                onChange={e => setSkillInput(e.target.value)}
                                onKeyDown={addSkill}
                                className="flex-1"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <Button
                        type="submit"
                        size="lg"
                        className="w-full h-14 text-xl"
                        disabled={loading}
                    >
                        {loading ? 'Launching...' : (
                            <>
                                <Rocket className="w-5 h-5 mr-3" /> Launch Project
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
