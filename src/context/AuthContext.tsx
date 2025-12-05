import React, { createContext, useContext, useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";

// ... (인터페이스 등 기존 코드 유지) ...
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
    // [수정됨] 로컬/배포 모두 현재 오리진을 기준으로 요청 (Vite Proxy 또는 Nginx Proxy 활용)
    // 로컬: http://localhost:5173/auth/google -> (Vite Proxy) -> http://localhost:3000/auth/google
    // 배포: https://revify.my/auth/google -> (Nginx Proxy) -> 백엔드 컨테이너
    window.location.href = `${window.location.origin}/auth/google`;
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
