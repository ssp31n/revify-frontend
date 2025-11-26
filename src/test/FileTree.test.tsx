import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import FileTree from "@/components/FileTree";
import { sessionsApi } from "@/lib/sessionsApi";

vi.mock("@/lib/sessionsApi", () => ({
  sessionsApi: {
    getFileTree: vi.fn(),
  },
}));

describe("FileTree Component", () => {
  const mockFiles = [
    { path: "README.md", name: "README.md", isDirectory: false, size: 100 },
    { path: "src", name: "src", isDirectory: true, size: 0 },
    { path: "src/index.js", name: "index.js", isDirectory: false, size: 200 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders file tree structure", async () => {
    (sessionsApi.getFileTree as any).mockResolvedValue(mockFiles);
    const onSelect = vi.fn();

    render(
      <FileTree sessionId="123" onFileSelect={onSelect} selectedPath={null} />
    );

    // 로딩 후 트리 아이템 확인
    await waitFor(() => {
      expect(screen.getByText("README.md")).toBeInTheDocument();
      expect(screen.getByText("src")).toBeInTheDocument();
    });
  });

  it("handles file selection", async () => {
    (sessionsApi.getFileTree as any).mockResolvedValue(mockFiles);
    const onSelect = vi.fn();

    render(
      <FileTree sessionId="123" onFileSelect={onSelect} selectedPath={null} />
    );

    await waitFor(() => {
      expect(screen.getByText("README.md")).toBeInTheDocument();
    });

    // 파일 클릭
    fireEvent.click(screen.getByText("README.md"));
    expect(onSelect).toHaveBeenCalledWith("README.md");
  });

  it("expands directory on click", async () => {
    (sessionsApi.getFileTree as any).mockResolvedValue(mockFiles);
    const onSelect = vi.fn();

    render(
      <FileTree sessionId="123" onFileSelect={onSelect} selectedPath={null} />
    );

    await waitFor(() => {
      expect(screen.getByText("src")).toBeInTheDocument();
    });

    // 처음에는 index.js가 안 보여야 함 (구현에 따라 다를 수 있지만, 보통 닫혀있음)
    // 여기서는 간단히 폴더 클릭 시 onSelect가 호출되지 않는지 확인 (파일 선택용이므로)
    fireEvent.click(screen.getByText("src"));
    expect(onSelect).not.toHaveBeenCalled();

    // index.js가 렌더링 되는지 확인 (하위 아이템)
    expect(screen.getByText("index.js")).toBeInTheDocument();
  });
});
