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

export interface FileNode {
  path: string;
  name: string;
  isDirectory: boolean;
  size: number;
  language?: string;
}

export interface CreateSessionData {
  title: string;
  description?: string;
  visibility: "private" | "link" | "public";
  commentPermission: "owner" | "invited" | "everyone";
}

export const sessionsApi = {
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

  getSessionById: async (id: string): Promise<Session> => {
    const response = await apiClient.get(`/sessions/${id}`);
    return response.data.data;
  },

  uploadFile: async (
    sessionId: string,
    file: File
  ): Promise<{ uploadId: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post(
      `/sessions/${sessionId}/uploads`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data.data;
  },

  // --- 추가된 부분 ---

  // 파일 트리 조회
  getFileTree: async (sessionId: string): Promise<FileNode[]> => {
    const response = await apiClient.get(`/sessions/${sessionId}/tree`);
    return response.data.data;
  },

  // 파일 내용 조회
  getFileContent: async (
    sessionId: string,
    filePath: string
  ): Promise<string> => {
    const response = await apiClient.get(`/sessions/${sessionId}/file`, {
      params: { path: filePath },
    });
    return response.data.data.content;
  },
};
