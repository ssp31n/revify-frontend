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
    getFileTree: vi.fn(),
    getFileContent: vi.fn(),
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

    // 1. Mock 객체 정의
    mockEventSource = {
      onmessage: null,
      addEventListener: vi.fn(),
      close: vi.fn(),
    };

    // 2. [수정됨] 화살표 함수 대신 일반 함수를 사용해야 'new'로 호출 가능
    vi.stubGlobal(
      "EventSource",
      vi.fn(function () {
        return mockEventSource;
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
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

    await waitFor(() => {
      expect(screen.getByText("Detail Session")).toBeInTheDocument();
    });

    const file = new File(["dummy"], "test.zip", { type: "application/zip" });
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    const uploadBtn = screen.getByRole("button", { name: /Start Upload/i });
    fireEvent.click(uploadBtn);

    // API 호출 확인
    await waitFor(() => {
      expect(sessionsApi.uploadFile).toHaveBeenCalled();
    });

    // EventSource 생성 확인
    expect(EventSource).toHaveBeenCalledWith(
      expect.stringContaining("/sessions/123/uploads/upload_abc/events"),
      expect.anything()
    );

    // 리스너 등록 대기
    await waitFor(() => {
      expect(mockEventSource.addEventListener).toHaveBeenCalledWith(
        "progress",
        expect.any(Function)
      );
    });

    // 진행 이벤트 시뮬레이션
    const progressCall = mockEventSource.addEventListener.mock.calls.find(
      (call: any[]) => call[0] === "progress"
    );
    const progressCallback = progressCall[1];

    progressCallback({
      data: JSON.stringify({ percent: 50, message: "Halfway there" }),
    } as MessageEvent);

    // UI 갱신 확인
    await waitFor(() => {
      expect(screen.getByText("50%")).toBeInTheDocument();
      expect(screen.getByText("Halfway there")).toBeInTheDocument();
    });
  });
});
