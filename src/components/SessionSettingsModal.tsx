import React, { useState, useEffect } from "react";
import { Session, sessionsApi } from "@/lib/sessionsApi";
import {
  X,
  Save,
  Trash2,
  AlertTriangle,
  Loader2,
  Link as LinkIcon,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";

interface SessionSettingsModalProps {
  session: Session;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedSession: Session) => void;
  onDelete: () => void;
}

const SessionSettingsModal: React.FC<SessionSettingsModalProps> = ({
  session,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const [formData, setFormData] = useState({
    title: session.title,
    description: session.description || "",
    visibility: session.visibility,
  });
  const [loading, setLoading] = useState(false);

  // 초대 링크 상태
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // 모달 열릴 때 기존 토큰 가져오기
  useEffect(() => {
    if (isOpen && session.visibility === "private") {
      sessionsApi
        .getInviteToken(session._id)
        .then(setInviteToken)
        .catch(() => setInviteToken(null));
    }
  }, [isOpen, session.visibility, session._id]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updated = await sessionsApi.updateSessionSettings(
        session._id,
        formData
      );
      onUpdate(updated);
      onClose();
    } catch (err) {
      alert("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this session? This action cannot be undone."
      )
    )
      return;
    try {
      setLoading(true);
      await sessionsApi.deleteSession(session._id);
      onDelete();
    } catch (err) {
      alert("Failed to delete session");
      setLoading(false);
    }
  };

  const generateToken = async () => {
    const token = await sessionsApi.refreshInviteToken(session._id);
    setInviteToken(token);
  };

  const copyLink = () => {
    if (!inviteToken) return;
    const url = `${window.location.origin}/join/${inviteToken}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border w-full max-w-md rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
          <h2 className="text-lg font-semibold text-foreground">
            Session Settings
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <form
            id="settings-form"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Title, Visibility, Description (기존 코드 유지) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Visibility
              </label>
              <select
                value={formData.visibility}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    visibility: e.target.value as any,
                  })
                }
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
              >
                <option value="private">Private (Only You & Invited)</option>
                <option value="link">Link Only (Anyone with link)</option>
                <option value="public">Public (Everyone)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground min-h-[80px]"
              />
            </div>
          </form>

          {/* 초대 링크 섹션 (Private일 때만 표시) */}
          {formData.visibility === "private" && (
            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <LinkIcon className="h-4 w-4" /> Invite Link
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                Anyone with this link can join this private session.
              </p>

              {inviteToken ? (
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={`${window.location.origin}/join/${inviteToken}`}
                    className="flex-1 bg-muted/50 border border-input rounded-md px-3 py-1 text-xs text-muted-foreground font-mono"
                  />
                  <button
                    onClick={copyLink}
                    className="p-2 border border-input rounded-md hover:bg-accent transition-colors"
                    title="Copy"
                  >
                    {isCopied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={generateToken}
                    className="p-2 border border-input rounded-md hover:bg-accent transition-colors"
                    title="Regenerate"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={generateToken}
                  className="text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-2 rounded-md transition-colors"
                >
                  Generate Invite Link
                </button>
              )}
            </div>
          )}

          {/* Danger Zone */}
          <div className="pt-6 border-t border-border">
            <h3 className="text-sm font-bold text-red-500 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Danger Zone
            </h3>
            <div className="p-4 border border-red-500/30 rounded-md bg-red-500/5">
              <p className="text-xs text-red-400 mb-3">
                Once you delete a session, there is no going back. Please be
                certain.
              </p>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white rounded-md px-4 py-2 text-sm font-medium transition-colors shadow-sm"
              >
                <Trash2 className="h-4 w-4" /> Delete Session
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/20 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            form="settings-form"
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionSettingsModal;
