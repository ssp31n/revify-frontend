import React, { createContext, useContext, useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";

// 사용자 타입 정의
export interface User {
  _id: string;
  provider: string;
  providerId: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 앱 실행 시 사용자 정보 확인
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data } = await apiClient.get("/auth/me");
      if (data.success) {
        setUser(data.user);
      }
    } catch (error) {
      // 401 에러 등은 로그인이 안 된 상태이므로 무시하고 user를 null로 유지
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = () => {
    // 백엔드의 OAuth 시작점으로 리다이렉트 (SPA 라우팅 아님)
    // 환경변수 또는 하드코딩된 백엔드 URL 사용
    const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    window.location.href = `${backendUrl}/auth/google`;
  };

  const logout = async () => {
    try {
      await apiClient.post("/auth/logout");
      setUser(null);
      // 로그아웃 후 홈으로 이동하거나 새로고침
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
