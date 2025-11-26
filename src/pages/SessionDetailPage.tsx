import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { sessionsApi, Session } from "@/lib/sessionsApi";
import { Loader2, ArrowLeft, Calendar, User } from "lucide-react";
import UploadPanel from "@/components/UploadPanel";
import FileTree from "@/components/FileTree";
import CodeViewer from "@/components/CodeViewer";
import { useAuth } from "@/context/AuthContext";

const SessionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 선택된 파일 상태 관리
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

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

  const handleUploadComplete = () => {
    if (id) fetchSession(id);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  if (error || !session)
    return (
      <div className="p-8 text-center text-destructive">
        {error || "Session not found"}
      </div>
    );

  const isOwner = user?._id === session.owner._id;
  const isReady = session.status === "ready";

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {" "}
      {/* 전체 높이 사용 */}
      <div className="p-4 border-b shrink-0">
        <div className="flex items-center justify-between mb-2">
          <Link
            to="/sessions"
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <span
            className={`px-2 py-0.5 rounded text-xs font-bold border ${
              session.status === "ready"
                ? "bg-green-100 text-green-700 border-green-200"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {session.status.toUpperCase()}
          </span>
        </div>
        <h1 className="text-xl font-bold truncate">{session.title}</h1>
      </div>
      {/* 메타 정보 */}
      <div className="flex flex-wrap gap-6 text-sm text-muted-foreground px-4 mb-4">
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
      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 overflow-hidden flex">
        {isReady ? (
          <>
            {/* 왼쪽 사이드바: 파일 트리 */}
            <div className="w-64 border-r bg-muted/10 shrink-0 flex flex-col">
              <div className="p-3 border-b text-xs font-semibold text-muted-foreground">
                FILES
              </div>
              <FileTree
                sessionId={session._id}
                onFileSelect={setSelectedFile}
                selectedPath={selectedFile}
              />
            </div>

            {/* 중앙: 코드 뷰어 */}
            <div className="flex-1 bg-background overflow-hidden">
              <CodeViewer sessionId={session._id} filePath={selectedFile} />
            </div>
          </>
        ) : (
          // 준비되지 않았을 때 (업로드 전/중)
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-2xl mx-auto">
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold mb-2">Setup Session</h2>
                <p className="text-muted-foreground">
                  Upload your source code (ZIP) to start reviewing.
                </p>
              </div>
              {isOwner ? (
                <UploadPanel
                  sessionId={session._id}
                  onUploadComplete={handleUploadComplete}
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  Waiting for owner to upload code...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionDetailPage;
