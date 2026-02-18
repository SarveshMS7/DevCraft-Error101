import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Plus, User, LogOut, Users } from "lucide-react";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";

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
            className="flex items-center gap-2 font-bold text-xl text-primary"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
              C
            </div>
            CollabSphere
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/projects"
              className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname.startsWith("/projects") ||
                location.pathname === "/"
                ? "text-primary"
                : "text-muted-foreground"
                }`}
            >
              Explore Projects
            </Link>

            <Link
              to="/explore-teams"
              className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname.startsWith("/explore-teams")
                ? "text-primary"
                : "text-muted-foreground"
                }`}
            >
              Explore Teams
            </Link>

            {user && (
              <Link
                to="/profile"
                className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === "/profile"
                  ? "text-primary"
                  : "text-muted-foreground"
                  }`}
              >
                My Profile
              </Link>
            )}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* Create Team */}
                <Button
                  size="sm"
                  variant="secondary"
                  className="hidden sm:flex"
                  onClick={() => navigate("/create-team")}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Create Team
                </Button>

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
        <Outlet />
      </main>

      <footer className="border-t py-6 bg-card">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2024 CollabSphere. Built for the Hackathon.
        </div>
      </footer>
    </div>
  );
}
