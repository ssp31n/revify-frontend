import React, { useState, useMemo } from "react";
import { Comment, sessionsApi } from "@/lib/sessionsApi";
import { MessageSquare, Check, CornerDownRight, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommentPanelProps {
  sessionId: string;
  filePath: string | null;
  activeLine: number | null;
  comments: Comment[];
  onCommentChange: () => void;
}

const CommentPanel: React.FC<CommentPanelProps> = ({
  sessionId,
  filePath,
  activeLine,
  comments,
  onCommentChange,
}) => {
  const [newComment, setNewComment] = useState("");
  const [replyContent, setReplyContent] = useState<{ [key: string]: string }>(
    {}
  );
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const threads = useMemo(() => {
    if (!filePath) return [];

    const fileComments = comments.filter((c) => c.filePath === filePath);
    const rootComments = fileComments.filter((c) => !c.parentComment);
    const replies = fileComments.filter((c) => c.parentComment);

    return rootComments
      .map((root) => ({
        ...root,
        replies: replies
          .filter((r) => r.parentComment === root._id)
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          ),
      }))
      .sort((a, b) => a.startLine - b.startLine);
  }, [comments, filePath]);

  const handleSubmit = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault();

    let targetStartLine = activeLine;
    let targetEndLine = activeLine;

    if (parentId) {
      const parentThread = threads.find((t) => t._id === parentId);
      if (parentThread) {
        targetStartLine = parentThread.startLine;
        targetEndLine = parentThread.endLine;
      }
    } else if (!activeLine) {
      return;
    }

    const content = parentId ? replyContent[parentId] : newComment;
    if (!content?.trim()) return;

    try {
      setLoading(true);
      await sessionsApi.createComment(sessionId, {
        filePath: filePath!,
        startLine: targetStartLine!,
        endLine: targetEndLine!,
        content,
        parentComment: parentId,
      });

      if (parentId) {
        setReplyContent((prev) => ({ ...prev, [parentId]: "" }));
        setReplyingTo(null);
      } else {
        setNewComment("");
      }
      onCommentChange();
    } catch (err) {
      alert("Failed to post comment");
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (commentId: string, currentStatus: boolean) => {
    try {
      await sessionsApi.updateComment(sessionId, commentId, {
        resolved: !currentStatus,
      });
      onCommentChange();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  if (!filePath) {
    return (
      <div className="p-4 text-sm text-muted-foreground text-center">
        Select a file to view comments
      </div>
    );
  }

  return (
    // [수정] w-96 고정 (너비 확장)
    <div className="h-full flex flex-col bg-muted/10 border-l border-border w-96 shrink-0">
      <div className="p-3 border-b border-border font-semibold text-sm flex items-center gap-2 bg-background text-foreground">
        <MessageSquare className="h-4 w-4" /> Comments
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activeLine && (
          <div className="border border-primary/50 rounded-md bg-background p-3 shadow-sm">
            <div className="text-xs font-medium text-muted-foreground mb-2">
              New comment on line {activeLine}
            </div>
            <form onSubmit={(e) => handleSubmit(e)}>
              <textarea
                className="w-full text-sm p-2 border border-input rounded resize-none focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground placeholder:text-muted-foreground"
                rows={3}
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading || !newComment.trim()}
                  className="bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1"
                >
                  <Send className="h-3 w-3" /> Post
                </button>
              </div>
            </form>
          </div>
        )}

        {threads.length === 0 && !activeLine ? (
          <div className="text-center text-sm text-muted-foreground py-10">
            No comments on this file yet.
          </div>
        ) : (
          threads.map((thread) => (
            <div
              key={thread._id}
              className={cn(
                "border border-border rounded-md bg-background shadow-sm transition-colors",
                thread.resolved && "opacity-60"
              )}
            >
              <div className="p-3 border-b border-border bg-muted/20 flex justify-between items-start">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono bg-muted text-foreground px-1.5 py-0.5 rounded text-[10px]">
                    L{thread.startLine}
                  </span>
                  <span className="font-semibold text-foreground">
                    {thread.author.displayName}
                  </span>
                  <span className="text-muted-foreground text-[10px]">
                    {new Date(thread.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => handleResolve(thread._id, thread.resolved)}
                  className={cn(
                    "p-1 rounded hover:bg-muted transition-colors",
                    thread.resolved ? "text-green-600" : "text-muted-foreground"
                  )}
                  title={
                    thread.resolved ? "Mark as unresolved" : "Mark as resolved"
                  }
                >
                  <Check className="h-4 w-4" />
                </button>
              </div>

              <div className="p-3 text-sm whitespace-pre-wrap text-foreground">
                {thread.content}
              </div>

              {thread.replies.length > 0 && (
                <div className="bg-muted/5 p-2 space-y-2 border-t border-border">
                  {thread.replies.map((reply) => (
                    <div key={reply._id} className="flex gap-2 text-sm">
                      <CornerDownRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                      <div className="flex-1 bg-background border border-border rounded p-2">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="font-semibold text-xs text-foreground">
                            {reply.author.displayName}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(reply.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-foreground">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!thread.resolved && (
                <div className="p-2 border-t border-border bg-muted/10">
                  {replyingTo === thread._id ? (
                    <form onSubmit={(e) => handleSubmit(e, thread._id)}>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="flex-1 text-sm border border-input rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground placeholder:text-muted-foreground"
                          placeholder="Reply..."
                          autoFocus
                          value={replyContent[thread._id] || ""}
                          onChange={(e) =>
                            setReplyContent({
                              ...replyContent,
                              [thread._id]: e.target.value,
                            })
                          }
                        />
                        <button
                          type="submit"
                          disabled={loading}
                          className="bg-primary text-primary-foreground p-1.5 rounded"
                        >
                          <Send className="h-3 w-3" />
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => setReplyingTo(thread._id)}
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      <CornerDownRight className="h-3 w-3" /> Reply
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentPanel;
