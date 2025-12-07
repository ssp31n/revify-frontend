import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { sessionsApi, Session, Comment } from "@/lib/sessionsApi";
import { Loader2, ArrowLeft, Settings } from "lucide-react";
import UploadPanel from "@/components/UploadPanel";
import FileTree from "@/components/FileTree";
import CodeViewer from "@/components/CodeViewer";
import CommentPanel from "@/components/CommentPanel";
import SessionSettingsModal from "@/components/SessionSettingsModal";
import { useAuth } from "@/context/AuthContext";

const SessionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSession(id);
      fetchComments(id);
    }
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

  const fetchComments = async (sessionId: string) => {
    try {
      const data = await sessionsApi.getComments(sessionId);
      setComments(data);
    } catch (err) {
      console.error("Failed to load comments", err);
    }
  };

  const handleUploadComplete = () => {
    if (id) fetchSession(id);
  };

  const handleLineSelect = useCallback((line: number) => {
    setActiveLine(line);
  }, []);

  const handleSessionDeleted = () => {
    navigate("/sessions");
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
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
    // [핵심 수정] h-full 대신 h-[calc(100vh-4rem)]을 사용하여 화면 높이를 강제합니다.
    // 만약 Layout 헤더 높이가 다르다면 4rem(64px) 부분을 조정하세요.
    // overflow-hidden을 주어 이 영역 밖으로 스크롤이 생기지 않게 막습니다.
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-background">
      {/* 헤더바 */}
      <div className="h-14 border-b border-border bg-background flex items-center justify-between px-4 shrink-0 z-10">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            to="/sessions"
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
            title="Back to list"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold truncate max-w-md">
                {session.title}
              </h1>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold border capitalize ${
                  session.status === "ready"
                    ? "bg-green-500/10 text-green-500 border-green-500/20"
                    : "bg-secondary text-secondary-foreground border-border"
                }`}
              >
                {session.status}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold border bg-blue-500/10 text-blue-500 border-blue-500/20 capitalize">
                {session.visibility}
              </span>
            </div>
          </div>
        </div>

        {isOwner && (
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
            title="Session Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* 메인 작업 영역 */}
      <div className="flex-1 flex overflow-hidden w-full">
        {isReady ? (
          <>
            {/* 1. 파일 트리 (Sidebar) */}
            <div className="w-72 border-r border-border bg-[#18181b] shrink-0 flex flex-col h-full">
              <div className="px-4 py-3 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider shrink-0">
                Explorer
              </div>

              {/* FileTree를 감싸는 div를 flex-1로 채우고 min-h-0을 줍니다 */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <FileTree
                  sessionId={session._id}
                  onFileSelect={(path) => {
                    setSelectedFile(path);
                    setActiveLine(null);
                  }}
                  selectedPath={selectedFile}
                />
              </div>
            </div>

            {/* 2. 코드 뷰어 영역 */}
            <div className="flex-1 bg-[#282c34] flex flex-col min-w-0 overflow-hidden relative h-full">
              <CodeViewer
                sessionId={session._id}
                filePath={selectedFile}
                onLineSelect={handleLineSelect}
              />
            </div>

            {/* 3. 코멘트 패널 */}
            <div className="h-full flex flex-col">
              <CommentPanel
                sessionId={session._id}
                filePath={selectedFile}
                activeLine={activeLine}
                comments={comments}
                onCommentChange={() => fetchComments(session._id)}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 p-8 flex flex-col items-center justify-center bg-muted/5 overflow-y-auto">
            <div className="max-w-md w-full text-center space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Setup Session</h2>
                <p className="text-muted-foreground">
                  Upload your source code (ZIP) to start reviewing.
                </p>
              </div>
              {isOwner ? (
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                  <UploadPanel
                    sessionId={session._id}
                    onUploadComplete={handleUploadComplete}
                  />
                </div>
              ) : (
                <div className="p-8 border border-dashed border-border rounded-xl text-muted-foreground bg-muted/10">
                  Waiting for owner to upload code...
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {isOwner && (
        <SessionSettingsModal
          session={session}
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onUpdate={(updated) => setSession(updated)}
          onDelete={handleSessionDeleted}
        />
      )}
    </div>
  );
};

export default SessionDetailPage;
