import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { sessionsApi, Session } from "@/lib/sessionsApi";
import { Loader2, ArrowLeft, Calendar, User } from "lucide-react";
import UploadPanel from "@/components/UploadPanel";
import { useAuth } from "@/context/AuthContext";

const SessionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchSession(id);
  }, [id]);

  const fetchSession = async (sessionId: string) => {
    try {
      setLoading(true);
      const data = await sessionsApi.getSessionById(sessionId);
      setSession(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load session details.");
    } finally {
      setLoading(false);
    }
  };

  // 업로드 완료 후 세션 정보를 다시 불러와 상태(ready) 갱신
  const handleUploadComplete = () => {
    if (id) fetchSession(id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <h2 className="text-2xl font-bold">Error</h2>
        <p className="text-muted-foreground">{error || "Session not found"}</p>
        <Link
          to="/sessions"
          className="text-primary hover:underline flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Sessions
        </Link>
      </div>
    );
  }

  const isOwner = user?._id === session.owner._id;

  return (
    <div className="space-y-6">
      {/* 상단 네비게이션 */}
      <div>
        <Link
          to="/sessions"
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to List
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              {session.title}
            </h1>
            <p className="text-muted-foreground text-lg">
              {session.description || "No description provided."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium border ${
                session.status === "ready"
                  ? "bg-green-100 text-green-700 border-green-200"
                  : session.status === "error"
                  ? "bg-red-100 text-red-700 border-red-200"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {session.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* 메타 정보 */}
      <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>
            Owner:{" "}
            <span className="font-medium text-foreground">
              {session.owner.displayName}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>
            Created: {new Date(session.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* 메인 영역 (추후 파일 트리/코드 뷰어) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border rounded-lg h-96 flex items-center justify-center bg-muted/20 text-muted-foreground p-8 text-center">
            {session.status === "ready" ? (
              <div>
                <p className="text-lg font-medium mb-2">
                  Code is ready for review!
                </p>
                <p className="text-sm">
                  (File Tree & Code Viewer will be implemented in the next step)
                </p>
              </div>
            ) : (
              <p>No code uploaded yet, or processing is in progress.</p>
            )}
          </div>
        </div>

        {/* 사이드 패널 (업로드) */}
        <div className="space-y-6">
          {isOwner ? (
            <UploadPanel
              sessionId={session._id}
              onUploadComplete={handleUploadComplete}
            />
          ) : (
            <div className="border rounded-lg p-6 bg-muted/50 text-center text-sm text-muted-foreground">
              Only the owner can upload files.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionDetailPage;
