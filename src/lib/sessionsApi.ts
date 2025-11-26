import apiClient from "./apiClient";

export interface Session {
  _id: string;
  owner: {
    _id: string;
    displayName: string;
    avatarUrl?: string;
  };
  title: string;
  description?: string;
  visibility: "private" | "link" | "public";
  status: "created" | "uploading" | "ready" | "error";
  createdAt: string;
  expiresAt: string;
}

export interface CreateSessionData {
  title: string;
  description?: string;
  visibility: "private" | "link" | "public";
  commentPermission: "owner" | "invited" | "everyone";
}

export const sessionsApi = {
  // 세션 목록 조회
  getSessions: async (): Promise<Session[]> => {
    const response = await apiClient.get("/sessions");
    return response.data.data; // 백엔드 응답 구조 { success: true, data: [...] }
  },

  // 세션 생성
  createSession: async (data: CreateSessionData): Promise<Session> => {
    const response = await apiClient.post("/sessions", data);
    return response.data.data;
  },

  // 세션 삭제
  deleteSession: async (id: string): Promise<void> => {
    await apiClient.delete(`/sessions/${id}`);
  },
};
