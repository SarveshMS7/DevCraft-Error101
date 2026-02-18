import { useState } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useSearchParams, Link } from 'react-router-dom';
import { Github } from 'lucide-react';

export function LoginPage() {
    const { signInWithGithub, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { toast } = useToast();
    const [searchParams] = useSearchParams();
    const isRegister = searchParams.get('tab') === 'register';

    const handleGithubLogin = async () => {
        try {
            setLoading(true);
            await signInWithGithub();
        } catch (error) {
            toast({
                title: "Login failed",
                description: "Could not authenticate with GitHub",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            await signInWithGoogle();
        } catch (error) {
            toast({
                title: "Login failed",
                description: "Could not authenticate with Google",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast({
                title: "Error",
                description: "Please fill in all fields",
                variant: "destructive"
            });
            return;
        }

        try {
            setLoading(true);
            if (isRegister) {
                await signUpWithEmail(email, password);
                toast({
                    title: "Success",
                    description: "Check your email for confirmation link",
                });
            } else {
                await signInWithEmail(email, password);
                toast({
                    title: "Success",
                    description: "Logged in successfully",
                });
            }
        } catch (error: any) {
            toast({
                title: "Authentication failed",
                description: error.message || "An error occurred",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-xl border shadow-lg text-center">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">{isRegister ? 'Create Account' : 'Welcome Back'}</h1>
                    <p className="text-muted-foreground">
                        {isRegister
                            ? 'Join the community and start building.'
                            : 'Sign in to access your projects and matches.'}
                    </p>
                </div>

                <div className="space-y-4">
                    <Button
                        variant="outline"
                        type="button"
                        className="w-full h-12 text-base"
                        onClick={handleGithubLogin}
                        disabled={loading}
                    >
                        <Github className="mr-2 h-5 w-5" />
                        Continue with GitHub
                    </Button>

                    <Button
                        variant="outline"
                        type="button"
                        className="w-full h-12 text-base"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                    >
                        <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Continue with Google
                    </Button>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                            Or continue with email
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2 text-left">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            placeholder="m@example.com"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>
                    <div className="space-y-2 text-left">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Processing...' : (isRegister ? 'Sign Up' : 'Sign In')}
                    </Button>
                </form>

                <div className="text-center text-sm">
                    {isRegister ? (
                        <p>
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary hover:underline font-medium">
                                Sign In
                            </Link>
                        </p>
                    ) : (
                        <p>
                            Don't have an account?{' '}
                            <Link to="/login?tab=register" className="text-primary hover:underline font-medium">
                                Sign Up
                            </Link>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
