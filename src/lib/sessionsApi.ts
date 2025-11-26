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
  // ... 기존 메서드들 (getSessions, createSession, deleteSession) 유지 ...

  getSessions: async (): Promise<Session[]> => {
    const response = await apiClient.get("/sessions");
    return response.data.data;
  },

  createSession: async (data: CreateSessionData): Promise<Session> => {
    const response = await apiClient.post("/sessions", data);
    return response.data.data;
  },

  deleteSession: async (id: string): Promise<void> => {
    await apiClient.delete(`/sessions/${id}`);
  },

  // --- 추가된 부분 ---

  // 세션 상세 조회
  getSessionById: async (id: string): Promise<Session> => {
    const response = await apiClient.get(`/sessions/${id}`);
    return response.data.data;
  },

  // 파일 업로드 (multipart/form-data)
  uploadFile: async (
    sessionId: string,
    file: File
  ): Promise<{ uploadId: string }> => {
    const formData = new FormData();
    formData.append("file", file);

    // 중요: Content-Type을 직접 설정하지 않거나 undefined로 두어 브라우저가 boundary를 설정하게 함
    const response = await apiClient.post(
      `/sessions/${sessionId}/uploads`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data;
  },
};
