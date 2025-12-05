import React, { createContext, useContext, useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";

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
      // [수정] 캐시 방지를 위해 timestamp 쿼리 스트링 추가
      // 브라우저가 401 응답을 캐싱하여 로그인 후에도 미로그인 상태로 인식하는 것을 방지
      const { data } = await apiClient.get(
        `/auth/me?_t=${new Date().getTime()}`
      );
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
    // [수정] 배포 환경과 로컬 환경에 따라 로그인 엔드포인트를 동적으로 결정
    if (import.meta.env.PROD) {
      // 배포 환경 (Docker/Nginx):
      // 현재 브라우저의 도메인(예: https://www.revify.my)을 기준으로 요청하여
      // 'www' 유무에 따른 uri mismatch를 방지하고 Nginx의 /auth 라우팅을 이용함
      window.location.href = `${window.location.origin}/auth/google`;
    } else {
      // 로컬 개발 환경:
      // 백엔드 포트(3000)로 직접 이동
      const backendUrl =
        import.meta.env.VITE_API_URL || "http://localhost:3000";
      window.location.href = `${backendUrl}/auth/google`;
    }
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
