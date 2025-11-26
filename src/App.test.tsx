import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "./App";

describe("App Routing", () => {
  it("renders HomePage by default", () => {
    render(<App />);

    // 1. Navbar의 로고 확인 (링크 역할, 이름이 Revify)
    const navbarLogo = screen.getByRole("link", { name: /^Revify$/ }); // 정확히 'Revify'인 링크
    expect(navbarLogo).toBeInTheDocument();

    // 2. HomePage의 제목 확인 (헤딩 역할, 텍스트 포함)
    const homeHeading = screen.getByRole("heading", {
      name: /Welcome to Revify/i,
    });
    expect(homeHeading).toBeInTheDocument();
  });

  it("navigates to Sessions page when clicking link", async () => {
    render(<App />);
    const sessionsLink = screen.getByRole("link", { name: /Sessions/i });
    expect(sessionsLink).toBeInTheDocument();
    expect(sessionsLink).toHaveAttribute("href", "/sessions");
  });
});
