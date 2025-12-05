import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { sessionsApi, Session } from "@/lib/sessionsApi";
// [수정] Copy 제거
import {
  Loader2,
  Plus,
  Lock,
  Globe,
  Link as LinkIcon,
  Settings,
  ChevronDown,
  Check,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import SessionSettingsModal from "@/components/SessionSettingsModal";
import { cn } from "@/lib/utils";

// VisibilityBadge
const VisibilityBadge = ({
  session,
  isOwner,
  onUpdate,
}: {
  session: Session;
  isOwner: boolean | null;
  onUpdate: (updated: Session) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const config = {
    private: {
      style:
        "bg-secondary text-secondary-foreground border-border hover:bg-secondary/80",
      icon: <Lock className="h-3 w-3" />,
      label: "Private",
    },
    public: {
      style:
        "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20",
      icon: <Globe className="h-3 w-3" />,
      label: "Public",
    },
    link: {
      style:
        "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20",
      icon: <LinkIcon className="h-3 w-3" />,
      label: "Link Only",
    },
  };
  const currentConfig = config[session.visibility] || config.link;

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const newVisibility = e.target.value as "private" | "public" | "link";
    if (newVisibility === session.visibility) return;
    try {
      setLoading(true);
      const updatedSession = await sessionsApi.updateSessionSettings(
        session._id,
        { visibility: newVisibility }
      );
      onUpdate(updatedSession);
    } catch (err) {
      alert("Failed to change visibility");
    } finally {
      setLoading(false);
    }
  };

  if (!isOwner) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider gap-1",
          currentConfig.style
        )}
      >
        {currentConfig.icon} {session.visibility}
      </span>
    );
  }

  return (
    <div
      className={cn(
        "relative inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider gap-1 transition-colors cursor-pointer group/badge",
        currentConfig.style,
        loading && "opacity-70 cursor-wait"
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        currentConfig.icon
      )}
      <span className="ml-0.5">{session.visibility}</span>
      <ChevronDown className="h-3 w-3 opacity-50 group-hover/badge:opacity-100 transition-opacity" />
      <select
        value={session.visibility}
        onChange={handleChange}
        disabled={loading}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-wait"
        title="Change Visibility"
      >
        <option value="private">Private</option>
        <option value="link">Link Only</option>
        <option value="public">Public</option>
      </select>
    </div>
  );
};

// CopyLinkButton
const CopyLinkButton = ({ session }: { session: Session }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    let url = "";
    if (session.visibility === "private") {
      if (session.inviteToken) {
        url = `${window.location.origin}/join/${session.inviteToken}`;
      } else {
        alert("Invite token not found. Please regenerate in settings.");
        return;
      }
    } else {
      url = `${window.location.origin}/sessions/${session._id}`;
    }
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "p-2 rounded-md transition-colors border border-transparent z-10",
        copied
          ? "text-green-500 bg-green-500/10 border-green-500/20"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-border"
      )}
      title="Copy Link"
    >
      {copied ? (
        <Check className="h-5 w-5" />
      ) : (
        <LinkIcon className="h-5 w-5" />
      )}
    </button>
  );
};

const SessionsPage = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    visibility: "link" as "private" | "link" | "public",
  });
  const [editingSession, setEditingSession] = useState<Session | null>(null);

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
        commentPermission: "everyone",
      });
      setSessions([newSession, ...sessions]);
      setFormData({ title: "", description: "", visibility: "link" });
    } catch (err) {
      console.error(err);
      alert("Failed to create session");
    } finally {
      setIsCreating(false);
    }
  };

  const openSettings = (e: React.MouseEvent, session: Session) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingSession(session);
  };

  const handleUpdateSession = (updatedSession: Session) => {
    setSessions((prev) =>
      prev.map((s) => (s._id === updatedSession._id ? updatedSession : s))
    );
  };

  const handleDeleteSession = () => {
    if (editingSession) {
      setSessions((prev) => prev.filter((s) => s._id !== editingSession._id));
      setEditingSession(null);
    }
  };

  if (loading && sessions.length === 0)
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 p-6 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Your Sessions
          </h1>
          <p className="text-muted-foreground">
            Manage your code review sessions here.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md border border-destructive/20">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="lg:col-span-1">
          <div className="border border-border rounded-lg p-6 bg-card text-card-foreground shadow-sm sticky top-20">
            <h3 className="font-semibold text-lg mb-4 text-foreground">
              Create New Session
            </h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Title
                </label>
                <input
                  type="text"
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary text-foreground placeholder:text-muted-foreground"
                  placeholder="e.g. Code Refactoring"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Description
                </label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary text-foreground placeholder:text-muted-foreground resize-none"
                  placeholder="Short description..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Visibility
                </label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary text-foreground"
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
                className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {isCreating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}{" "}
                Create Session
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          {sessions.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-lg bg-muted/5">
              <p className="text-muted-foreground">
                No sessions found. Create one to get started!
              </p>
            </div>
          ) : (
            sessions.map((session) => {
              const ownerId =
                typeof session.owner === "object"
                  ? session.owner._id
                  : session.owner;
              const ownerName =
                typeof session.owner === "object"
                  ? session.owner.displayName
                  : "Unknown";
              const isOwner = user && ownerId === user._id;

              return (
                <Link
                  to={`/sessions/${session._id}`}
                  key={session._id}
                  className="block border border-border rounded-lg p-4 bg-card hover:bg-accent/50 hover:border-primary/50 transition-all group relative"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1.5 flex-1 min-w-0 pr-20">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-lg text-foreground truncate group-hover:text-primary transition-colors">
                          {session.title}
                        </h4>
                        <VisibilityBadge
                          session={session}
                          isOwner={isOwner}
                          onUpdate={handleUpdateSession}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {session.description || "No description"}
                      </p>
                      <div className="text-xs text-muted-foreground pt-1 flex items-center gap-2">
                        <span>Owner: {ownerName}</span>
                        <span>•</span>
                        <span>
                          {new Date(session.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {isOwner && (
                      <div className="absolute top-4 right-4 flex gap-1">
                        <CopyLinkButton session={session} />
                        <button
                          onClick={(e) => openSettings(e, session)}
                          className="p-2 rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent hover:border-border"
                          title="Settings"
                        >
                          <Settings className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {editingSession && (
        <SessionSettingsModal
          session={editingSession}
          isOpen={!!editingSession}
          onClose={() => setEditingSession(null)}
          onUpdate={handleUpdateSession}
          onDelete={handleDeleteSession}
        />
      )}
    </div>
  );
};

export default SessionsPage;
