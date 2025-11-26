import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, Mock } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Navbar from "@/components/Navbar";
import * as AuthContextModule from "@/context/AuthContext";

// useAuth 훅을 모킹하기 위한 설정
vi.mock("@/context/AuthContext", async () => {
  const actual = await vi.importActual("@/context/AuthContext");
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

describe("Navbar Component", () => {
  const mockLogin = vi.fn();
  const mockLogout = vi.fn();

  it("renders login button when user is null", () => {
    // 1. 비로그인 상태 모킹
    (AuthContextModule.useAuth as Mock).mockReturnValue({
      user: null,
      isLoading: false,
      login: mockLogin,
      logout: mockLogout,
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    // Login 버튼이 있어야 함
    const loginBtn = screen.getByRole("button", { name: /Login with Google/i });
    expect(loginBtn).toBeInTheDocument();

    // 로그아웃 버튼이나 유저 이름은 없어야 함
    expect(screen.queryByText(/Logout/i)).not.toBeInTheDocument();

    // 클릭 시 login 함수 호출 확인
    fireEvent.click(loginBtn);
    expect(mockLogin).toHaveBeenCalled();
  });

  it("renders user info and logout button when user is logged in", () => {
    // 2. 로그인 상태 모킹
    (AuthContextModule.useAuth as Mock).mockReturnValue({
      user: {
        _id: "123",
        displayName: "Test User",
        email: "test@example.com",
        provider: "google",
        providerId: "google_123",
      },
      isLoading: false,
      login: mockLogin,
      logout: mockLogout,
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    // 유저 이름 표시 확인
    expect(screen.getByText("Test User")).toBeInTheDocument();

    // Logout 버튼 확인
    const logoutBtn = screen.getByRole("button", { name: /Logout/i });
    expect(logoutBtn).toBeInTheDocument();

    // 클릭 시 logout 함수 호출 확인
    fireEvent.click(logoutBtn);
    expect(mockLogout).toHaveBeenCalled();
  });
});
