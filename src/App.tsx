import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/features/auth/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/Layout";

import { LandingPage } from "@/features/pages/LandingPage";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { ProjectsPage } from "@/features/projects/pages/ProjectsPage";
import { ProfilePage } from "@/features/profile/pages/ProfilePage";
import { CreateProjectPage } from "@/features/projects/pages/CreateProjectPage";
import { ProjectDetailPage } from "@/features/projects/pages/ProjectDetailPage";
import CreateTeam from "@/features/projects/pages/CreateTeam";
import ExploreTeamsPage from "@/features/join-teams/pages/ExploreTeamsPage";


// ===============================
// 🔐 Protected Route Wrapper
// ===============================
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-8">Loading auth...</div>;

  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
};


// ===============================
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
              path="/create-team"
              element={
                <ProtectedRoute>
                  <CreateTeam />
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
              element={<div className="p-8">404 - Page Not Found</div>}
            />

          </Route>
        </Routes>

        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
