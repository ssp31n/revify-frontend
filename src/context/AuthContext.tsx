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
  // [수정] returnPath 인자 추가 (선택적)
  login: (returnPath?: string) => void;
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

  // [수정] 로그인 함수: returnPath가 있으면 쿼리 파라미터로 전달
  const login = (returnPath?: string) => {
    let authUrl = "";

    if (import.meta.env.PROD) {
      authUrl = `${window.location.origin}/auth/google`;
    } else {
      const backendUrl =
        import.meta.env.VITE_API_URL || "http://localhost:3000";
      authUrl = `${backendUrl}/auth/google`;
    }

    // 돌아올 경로가 있다면 쿼리 스트링에 추가
    if (returnPath) {
      authUrl += `?returnTo=${encodeURIComponent(returnPath)}`;
    }

    window.location.href = authUrl;
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
