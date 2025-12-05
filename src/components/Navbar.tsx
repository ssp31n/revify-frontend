import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Loader2,
  LogOut,
  User as UserIcon,
  Code2,
  Terminal,
} from "lucide-react";

const Navbar = () => {
  const { user, login, logout, isLoading } = useAuth();

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-14 flex items-center px-4 sticky top-0 z-50 w-full shrink-0">
      <div className="flex items-center justify-between w-full">
        {/* 로고 및 메뉴 */}
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="font-bold text-xl flex items-center gap-2 text-foreground tracking-tight hover:opacity-80 transition-opacity"
          >
            <div className="bg-primary/20 p-1.5 rounded-md">
              <Code2 className="h-5 w-5 text-primary" />
            </div>
            {/* [수정] Revify -> revify (소문자 변경) */}
            <span className="font-mono">revify</span>
          </Link>
          <div className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
            {/* [삭제] Dashboard 링크 제거됨 */}
            <Link
              to="/sessions"
              className="hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <Terminal className="h-4 w-4" />
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
              <div className="flex items-center gap-3 text-sm font-medium bg-secondary/50 px-3 py-1.5 rounded-full border border-border">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.displayName}
                    className="h-6 w-6 rounded-full border border-background"
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                    <UserIcon className="h-3 w-3" />
                  </div>
                )}
                <span className="hidden sm:inline-block text-foreground">
                  {user.displayName}
                </span>
              </div>
              <button
                onClick={logout}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent hover:bg-secondary hover:text-accent-foreground h-9 px-3"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => login()}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 shadow-sm"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
