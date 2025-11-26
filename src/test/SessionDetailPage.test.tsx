import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import SessionDetailPage from "@/pages/SessionDetailPage";
import { sessionsApi } from "@/lib/sessionsApi";
import { MemoryRouter, Route, Routes } from "react-router-dom";

// API 모킹
vi.mock("@/lib/sessionsApi", () => ({
  sessionsApi: {
    getSessionById: vi.fn(),
    uploadFile: vi.fn(),
  },
}));

// AuthContext 모킹
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: { _id: "user1", displayName: "Tester" },
  }),
}));

describe("SessionDetailPage Integration", () => {
  let mockEventSource: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // EventSource Mock 구현
    mockEventSource = {
      onmessage: null,
      addEventListener: vi.fn(),
      close: vi.fn(),
    };
    global.EventSource = vi.fn(() => mockEventSource) as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders session info and uploads file with progress", async () => {
    const mockSession = {
      _id: "123",
      title: "Detail Session",
      description: "Desc",
      status: "created",
      owner: { _id: "user1", displayName: "Tester" },
      createdAt: new Date().toISOString(),
    };

    (sessionsApi.getSessionById as any).mockResolvedValue(mockSession);
    (sessionsApi.uploadFile as any).mockResolvedValue({
      uploadId: "upload_abc",
    });

    render(
      <MemoryRouter initialEntries={["/sessions/123"]}>
        <Routes>
          <Route path="/sessions/:id" element={<SessionDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    // 1. 세션 정보 로드 확인
    await waitFor(() => {
      expect(screen.getByText("Detail Session")).toBeInTheDocument();
    });

    // 2. 파일 선택
    const file = new File(["dummy"], "test.zip", { type: "application/zip" });

    // hidden input 찾기
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    // 3. 업로드 시작
    const uploadBtn = screen.getByRole("button", { name: /Start Upload/i });
    fireEvent.click(uploadBtn);

    // 4. API 호출 확인
    await waitFor(() => {
      expect(sessionsApi.uploadFile).toHaveBeenCalled();
    });

    // 5. SSE 연결 확인
    expect(global.EventSource).toHaveBeenCalledWith(
      expect.stringContaining("/sessions/123/uploads/upload_abc/events"),
      expect.anything()
    );

    // 6. SSE 이벤트 시뮬레이션 (Progress)
    // addEventListener의 두 번째 인자인 콜백 함수를 찾아서 호출
    const progressCallback = mockEventSource.addEventListener.mock.calls.find(
      (call: any[]) => call[0] === "progress"
    )[1];

    progressCallback({
      data: JSON.stringify({ percent: 50, message: "Halfway there" }),
    } as MessageEvent);

    // 7. UI 갱신 확인
    await waitFor(() => {
      expect(screen.getByText("50%")).toBeInTheDocument();
      expect(screen.getByText("Halfway there")).toBeInTheDocument();
    });
  });
});
