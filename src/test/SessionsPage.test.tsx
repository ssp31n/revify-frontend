import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SessionsPage from "@/pages/SessionsPage";
import { sessionsApi } from "@/lib/sessionsApi";
import { MemoryRouter } from "react-router-dom";

// API 모킹
vi.mock("@/lib/sessionsApi", () => ({
  sessionsApi: {
    getSessions: vi.fn(),
    createSession: vi.fn(),
    deleteSession: vi.fn(),
  },
}));

// AuthContext 모킹
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: { _id: "user1", displayName: "Tester" },
  }),
}));

describe("SessionsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders session list after loading", async () => {
    const mockSessions = [
      {
        _id: "1",
        title: "Test Session 1",
        description: "Desc 1",
        visibility: "public",
        owner: { _id: "user1" },
        createdAt: new Date().toISOString(),
      },
    ];
    (sessionsApi.getSessions as any).mockResolvedValue(mockSessions);

    render(
      <MemoryRouter>
        <SessionsPage />
      </MemoryRouter>
    );

    // 로딩이 끝나고 세션 목록이 나올 때까지 대기
    await waitFor(() => {
      expect(screen.getByText("Test Session 1")).toBeInTheDocument();
    });

    expect(screen.getByText("Desc 1")).toBeInTheDocument();
  });

  it("creates a new session", async () => {
    // 초기 로딩 시 빈 목록 반환
    (sessionsApi.getSessions as any).mockResolvedValue([]);
    // 생성 API 호출 결과 모킹
    (sessionsApi.createSession as any).mockResolvedValue({
      _id: "2",
      title: "New Session",
      description: "New Desc",
      visibility: "private",
      owner: { _id: "user1" },
      createdAt: new Date().toISOString(),
    });

    render(
      <MemoryRouter>
        <SessionsPage />
      </MemoryRouter>
    );

    // 1. [중요] 로딩이 끝나고 "Create Session" 버튼(폼)이 나타날 때까지 대기
    // getBy... 는 즉시 찾지만, findBy... 또는 waitFor를 쓰면 기다려줍니다.
    await waitFor(() => {
      expect(screen.queryByText(/No sessions found/i)).toBeInTheDocument();
    });

    // 2. 폼 입력 (이제 폼이 렌더링된 상태임)
    fireEvent.change(screen.getByPlaceholderText("e.g. Code Refactoring"), {
      target: { value: "New Session" },
    });
    fireEvent.change(screen.getByPlaceholderText("Short description..."), {
      target: { value: "New Desc" },
    });
    fireEvent.change(screen.getByRole("combobox"), {
      // Select box
      target: { value: "private" },
    });

    // 3. 제출
    fireEvent.click(screen.getByRole("button", { name: /Create Session/i }));

    // 4. API 호출 확인
    await waitFor(() => {
      expect(sessionsApi.createSession).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "New Session",
          description: "New Desc",
          visibility: "private",
        })
      );
    });

    // 5. 화면 갱신 확인 (새 세션이 목록에 추가됨)
    expect(screen.getByText("New Session")).toBeInTheDocument();
  });
});
