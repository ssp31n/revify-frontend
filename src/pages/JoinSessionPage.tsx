import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom"; // useLocation 추가
import { sessionsApi } from "@/lib/sessionsApi";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

const JoinSessionPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const location = useLocation(); // 현재 경로 확인용
  const { user, isLoading: authLoading, login } = useAuth();
  const [status, setStatus] = useState<"joining" | "error">("joining");
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    // 로그인 안 되어 있으면 대기 (버튼 표시)
    if (!user) {
      return;
    }

    if (token) {
      sessionsApi
        .joinSession(token)
        .then((data) => {
          // 이미 가입된 경우도 data.sessionId는 옴
          navigate(`/sessions/${data.sessionId}`);
        })
        .catch((err) => {
          console.error(err);
          setStatus("error");
          setError(err.response?.data?.error?.message || "Invalid invite link");
        });
    }
  }, [token, user, authLoading, navigate]);

  const handleLogin = () => {
    // [수정] 현재 경로(/join/xxxx)를 인자로 넘김
    login(location.pathname);
  };

  if (authLoading)
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background text-foreground gap-4">
        <h1 className="text-2xl font-bold">Join Private Session</h1>
        <p className="text-muted-foreground">
          You need to sign in to join this session.
        </p>
        <button
          onClick={handleLogin} // 수정된 핸들러 연결
          className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background text-foreground gap-4">
        <h1 className="text-2xl font-bold text-destructive">Failed to Join</h1>
        <p className="text-muted-foreground">{error}</p>
        <button
          onClick={() => navigate("/")}
          className="text-primary hover:underline"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-background text-foreground gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p>Joining session...</p>
    </div>
  );
};

export default JoinSessionPage;
