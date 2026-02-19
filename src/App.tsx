import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/features/auth/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/Layout";
import { EmptyState } from "@/components/shared/EmptyState";
import { Loader2, AlertTriangle } from "lucide-react";

import LandingPage from "./features/landing-page/app/page";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { ProjectsPage } from "@/features/projects/pages/ProjectsPage";
import { ProfilePage } from "@/features/profile/pages/ProfilePage";
import { CreateProjectPage } from "@/features/projects/pages/CreateProjectPage";
import { ProjectDetailPage } from "@/features/projects/pages/ProjectDetailPage";

import ExploreTeamsPage from "@/features/explore-teams/pages/ExploreTeamsPage";


// ===============================
// 🔐 Protected Route Wrapper
// ===============================
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );

    if (!user) return <Navigate to="/login" replace />;

    return <>{children}</>;
};

// ===============================
// 🚫 404 Page
// ===============================
function NotFoundPage() {
    const navigate = useNavigate();
    return (
        <EmptyState
            icon={AlertTriangle}
            title="404 — Page Not Found"
            description="The page you're looking for doesn't exist or has been moved."
            actionLabel="Go Home"
            onAction={() => navigate('/')}
        />
    );
}

// 🚀 App Component
// ===============================
function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route element={<Layout />}>

                        {/* Public Routes */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/projects" element={<ProjectsPage />} />

                        {/* Explore Teams */}
                        <Route
                            path="/explore-teams"
                            element={
                                <ProtectedRoute>
                                    <ExploreTeamsPage />
                                </ProtectedRoute>
                            }
                        />

                        {/* Protected Routes */}
                        <Route
                            path="/projects/new"
                            element={
                                <ProtectedRoute>
                                    <CreateProjectPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/projects/:id"
                            element={
                                <ProtectedRoute>
                                    <ProjectDetailPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <ProfilePage />
                                </ProtectedRoute>
                            }
                        />

                        {/* 404 */}
                        <Route
                            path="*"
                            element={<NotFoundPage />}
                        />

                    </Route>
                </Routes>

                <Toaster />
            </AuthProvider>
        </Router>
    );
}

export default App;
