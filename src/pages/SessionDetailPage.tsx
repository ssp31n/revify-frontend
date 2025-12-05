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
      <div className="flex justify-center items-center h-full">
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
    // h-full로 변경하여 Layout의 flex-1 영역을 모두 채움 (스크롤 없음)
    <div className="h-full flex flex-col overflow-hidden">
      {/* 헤더바: 높이 최소화, 좌우 패딩은 조금 여유 있게 */}
      <div className="h-14 border-b border-border bg-background flex items-center justify-between px-4 shrink-0">
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

        {/* 우측 설정 버튼 */}
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

      {/* 메인 작업 영역: 3단 레이아웃 (트리 - 코드 - 코멘트) */}
      <div className="flex-1 overflow-hidden flex flex-row">
        {isReady ? (
          <>
            {/* 1. 파일 트리: w-72로 확장 */}
            <div className="w-72 border-r border-border bg-[#18181b] shrink-0 flex flex-col">
              {" "}
              {/* 더 어두운 배경 */}
              <div className="px-4 py-3 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Explorer
              </div>
              <FileTree
                sessionId={session._id}
                onFileSelect={(path) => {
                  setSelectedFile(path);
                  setActiveLine(null);
                }}
                selectedPath={selectedFile}
              />
            </div>

            {/* 2. 코드 뷰어: 남은 공간 전체 (flex-1) */}
            <div className="flex-1 bg-[#282c34] overflow-hidden min-w-0 relative flex flex-col">
              <CodeViewer
                sessionId={session._id}
                filePath={selectedFile}
                onLineSelect={handleLineSelect}
              />
            </div>

            {/* 3. 코멘트 패널: w-96으로 확장하여 가독성 확보 */}
            <CommentPanel
              sessionId={session._id}
              filePath={selectedFile}
              activeLine={activeLine}
              comments={comments}
              onCommentChange={() => fetchComments(session._id)}
            />
          </>
        ) : (
          <div className="flex-1 p-8 flex flex-col items-center justify-center bg-muted/5">
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
