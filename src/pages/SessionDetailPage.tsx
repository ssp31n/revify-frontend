import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom"; // useNavigate 추가
import { sessionsApi, Session, Comment } from "@/lib/sessionsApi";
import { Loader2, ArrowLeft, Settings } from "lucide-react"; // Settings 아이콘 추가
import UploadPanel from "@/components/UploadPanel";
import FileTree from "@/components/FileTree";
import CodeViewer from "@/components/CodeViewer";
import CommentPanel from "@/components/CommentPanel";
import SessionSettingsModal from "@/components/SessionSettingsModal"; // 모달 추가
import { useAuth } from "@/context/AuthContext";

const SessionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate(); // 삭제 후 이동을 위해 추가
  const { user } = useAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // 모달 상태

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

  // 세션 삭제 시 목록으로 이동
  const handleSessionDeleted = () => {
    navigate("/sessions");
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
      <div className="p-4 border-b shrink-0 bg-background z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Link
              to="/sessions"
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
            <span
              className={`px-2 py-0.5 rounded text-xs font-bold border ${
                session.status === "ready"
                  ? "bg-green-500/10 text-green-500 border-green-500/20"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {session.status.toUpperCase()}
            </span>
            {/* 공개 범위 뱃지 추가 */}
            <span className="px-2 py-0.5 rounded text-xs font-bold border bg-blue-500/10 text-blue-500 border-blue-500/20 capitalize">
              {session.visibility}
            </span>
          </div>

          {/* 설정 버튼 (오너만 보임) */}
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
        <h1 className="text-xl font-bold truncate">{session.title}</h1>
        <p className="text-sm text-muted-foreground mt-1 truncate">
          {session.description}
        </p>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {isReady ? (
          <>
            {/* 1. 파일 트리 */}
            <div className="w-64 border-r border-border bg-muted/5 shrink-0 flex flex-col">
              <div className="p-3 border-b border-border text-xs font-semibold text-muted-foreground">
                FILES
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

            {/* 2. 코드 뷰어 */}
            <div className="flex-1 bg-background overflow-hidden min-w-0">
              <CodeViewer
                sessionId={session._id}
                filePath={selectedFile}
                onLineSelect={handleLineSelect}
              />
            </div>

            {/* 3. 코멘트 패널 */}
            <CommentPanel
              sessionId={session._id}
              filePath={selectedFile}
              activeLine={activeLine}
              comments={comments}
              onCommentChange={() => fetchComments(session._id)}
            />
          </>
        ) : (
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

      {/* 설정 모달 */}
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
