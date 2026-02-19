import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Plus, User, LogOut } from "lucide-react";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

export function Layout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 font-extrabold text-2xl text-primary tracking-wide"
          >
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-primary-foreground text-lg">
              C
            </div>
            <span className="text-3xl">CollabSphere</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            
            {/* Home */}
            <Link
              to="/"
              className={`text-base font-semibold transition-colors hover:text-primary ${
                location.pathname === "/"
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              Home
            </Link>

            {/* Explore Projects */}
            <Link
              to="/projects"
              className={`text-base font-semibold transition-colors hover:text-primary ${
                location.pathname.startsWith("/projects")
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              Explore Projects
            </Link>

            {/* Explore Teams */}
            <Link
              to="/explore-teams"
              className={`text-base font-semibold transition-colors hover:text-primary ${
                location.pathname.startsWith("/explore-teams")
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              Explore Teams
            </Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* New Project */}
                <Button
                  size="sm"
                  variant="default"
                  className="hidden sm:flex"
                  onClick={() => navigate("/projects/new")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>

                {/* Notification Bell */}
                <NotificationBell />

                {/* Profile + Logout */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate("/profile")}
                  >
                    <User className="w-5 h-5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-5 h-5" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Log in</Link>
                </Button>
                <Button asChild>
                  <Link to="/login?tab=register">Sign up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      <footer className="border-t py-6 bg-card">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2024 CollabSphere. Built for the Hackathon.
        </div>
      </footer>
    </div>
  );
}
