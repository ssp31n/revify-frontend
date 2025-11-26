import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { sessionsApi, Session } from "@/lib/sessionsApi";
import {
  Loader2,
  Plus,
  Lock,
  Globe,
  Link as LinkIcon,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const SessionsPage = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 생성 폼 상태
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    visibility: "link" as "private" | "link" | "public",
  });

  // 데이터 로드
  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await sessionsApi.getSessions();
      setSessions(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load sessions.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsCreating(true);
      const newSession = await sessionsApi.createSession({
        ...formData,
        commentPermission: "everyone", // 기본값
      });
      // 목록 갱신 및 폼 초기화
      setSessions([newSession, ...sessions]);
      setFormData({ title: "", description: "", visibility: "link" });
    } catch (err) {
      console.error(err);
      alert("Failed to create session");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this session?"))
      return;
    try {
      await sessionsApi.deleteSession(id);
      setSessions(sessions.filter((s) => s._id !== id));
    } catch (err) {
      alert("Failed to delete session");
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "private":
        return <Lock className="h-4 w-4" />;
      case "public":
        return <Globe className="h-4 w-4" />;
      default:
        return <LinkIcon className="h-4 w-4" />;
    }
  };

  if (loading && sessions.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Sessions</h1>
          <p className="text-muted-foreground">
            Manage your code review sessions here.
          </p>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          {error}
        </div>
      )}

      {/* 생성 폼 및 목록 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 왼쪽: 세션 생성 폼 */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 bg-card text-card-foreground shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Create New Session</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <input
                  type="text"
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="e.g. Code Refactoring"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Short description..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Visibility</label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={formData.visibility}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      visibility: e.target.value as any,
                    })
                  }
                >
                  <option value="link">Link Only (Unlisted)</option>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isCreating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Create Session
              </button>
            </form>
          </div>
        </div>

        {/* 오른쪽: 세션 목록 */}
        <div className="lg:col-span-2 space-y-4">
          {sessions.length === 0 ? (
            <div className="text-center py-10 border border-dashed rounded-lg">
              <p className="text-muted-foreground">
                No sessions found. Create one to get started!
              </p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session._id}
                className="border rounded-lg p-4 bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-lg hover:underline cursor-pointer">
                        {/* 상세 페이지 링크는 추후 구현 */}
                        <Link to={`/sessions/${session._id}`}>
                          {session.title}
                        </Link>
                      </h4>
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-foreground">
                        {getVisibilityIcon(session.visibility)}
                        <span className="ml-1 capitalize">
                          {session.visibility}
                        </span>
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {session.description || "No description"}
                    </p>
                    <div className="text-xs text-muted-foreground pt-2">
                      Created {new Date(session.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {user?._id === session.owner._id && (
                    <button
                      onClick={() => handleDelete(session._id)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-2"
                      title="Delete Session"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionsPage;
