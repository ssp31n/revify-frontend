import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2, LogOut, User as UserIcon } from "lucide-react";

const Navbar = () => {
  const { user, login, logout, isLoading } = useAuth();

  return (
    <nav className="border-b h-14 flex items-center px-4 md:px-6 bg-background">
      <div className="flex items-center justify-between w-full max-w-6xl mx-auto">
        {/* 로고 및 메뉴 */}
        <div className="flex items-center gap-6">
          <Link to="/" className="font-bold text-xl flex items-center gap-2">
            Revify
          </Link>
          <div className="flex gap-4 text-sm font-medium text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <Link
              to="/sessions"
              className="hover:text-primary transition-colors"
            >
              Sessions
            </Link>
          </div>
        </div>

        {/* 우측 인증 버튼 영역 */}
        <div className="flex items-center gap-4">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.displayName}
                    className="h-8 w-8 rounded-full border bg-muted"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <UserIcon className="h-4 w-4" />
                  </div>
                )}
                <span className="hidden sm:inline-block">
                  {user.displayName}
                </span>
              </div>
              <button
                onClick={logout}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={login}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
            >
              Login with Google
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
