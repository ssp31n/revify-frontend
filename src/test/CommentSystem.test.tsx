import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CommentPanel from "@/components/CommentPanel";
import { sessionsApi } from "@/lib/sessionsApi";

// Mocking
vi.mock("@/lib/sessionsApi", () => ({
  sessionsApi: {
    createComment: vi.fn(),
    updateComment: vi.fn(),
  },
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: { _id: "user1", displayName: "Tester" },
  }),
}));

describe("CommentPanel", () => {
  const mockComments = [
    {
      _id: "c1",
      session: "s1",
      author: { _id: "user1", displayName: "Tester" },
      filePath: "index.js",
      startLine: 5,
      endLine: 5,
      content: "Existing comment",
      resolved: false,
      parentComment: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders existing comments", () => {
    render(
      <CommentPanel
        sessionId="s1"
        filePath="index.js"
        activeLine={null}
        comments={mockComments as any}
        onCommentChange={vi.fn()}
      />
    );

    expect(screen.getByText("Existing comment")).toBeInTheDocument();
    expect(screen.getByText("L5")).toBeInTheDocument();
  });

  it("shows create form when a line is active", () => {
    render(
      <CommentPanel
        sessionId="s1"
        filePath="index.js"
        activeLine={10} // Line 10 selected
        comments={[]}
        onCommentChange={vi.fn()}
      />
    );

    expect(screen.getByText("New comment on line 10")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Write a comment...")
    ).toBeInTheDocument();
  });

  it("submits a new comment", async () => {
    const onCommentChange = vi.fn();
    (sessionsApi.createComment as any).mockResolvedValue({});

    render(
      <CommentPanel
        sessionId="s1"
        filePath="index.js"
        activeLine={10}
        comments={[]}
        onCommentChange={onCommentChange}
      />
    );

    const textarea = screen.getByPlaceholderText("Write a comment...");
    fireEvent.change(textarea, { target: { value: "My new insight" } });

    const submitBtn = screen.getByRole("button", { name: /Post/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(sessionsApi.createComment).toHaveBeenCalledWith(
        "s1",
        expect.objectContaining({
          filePath: "index.js",
          startLine: 10,
          content: "My new insight",
        })
      );
      expect(onCommentChange).toHaveBeenCalled();
    });
  });
});
