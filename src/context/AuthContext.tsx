import React, { createContext, useContext, useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";

// ... (인터페이스 정의는 기존과 동일) ...
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

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      // [수정됨] 캐시 방지를 위해 timestamp 추가
      const { data } = await apiClient.get(
        `/auth/me?_t=${new Date().getTime()}`
      );
      if (data.success) {
        setUser(data.user);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = () => {
    // 환경변수 또는 하드코딩된 백엔드 URL 사용 (Nginx Proxy를 타므로 상대경로 /auth 도 가능하지만 명시적 URL 권장)
    const backendUrl = import.meta.env.VITE_API_URL || "https://revify.my";
    // 주의: 위 VITE_API_URL이 /api라면 /auth 경로는 별도로 처리해야 함.
    // Nginx 설정상 /auth는 루트 레벨이므로, 도메인을 직접 쓰는 게 안전함.
    window.location.href = `https://revify.my/auth/google`;
  };

  const logout = async () => {
    try {
      await apiClient.post("/auth/logout");
      setUser(null);
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
