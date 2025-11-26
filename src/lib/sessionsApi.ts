import apiClient from "./apiClient";

// ... 기존 인터페이스 (Session, FileNode, CreateSessionData) 유지 ...

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

// --- 추가된 인터페이스 ---
export interface Comment {
  _id: string;
  session: string;
  author: {
    _id: string;
    displayName: string;
    avatarUrl?: string;
  };
  filePath: string;
  startLine: number;
  endLine: number;
  content: string;
  resolved: boolean;
  parentComment: string | null;
  createdAt: string;
  updatedAt: string;
}

export const sessionsApi = {
  // ... 기존 메서드들 유지 ...
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
        headers: { "Content-Type": undefined }, // 브라우저 자동 설정
      }
    );
    return response.data.data;
  },
  getFileTree: async (sessionId: string): Promise<FileNode[]> => {
    const response = await apiClient.get(`/sessions/${sessionId}/tree`);
    return response.data.data;
  },
  getFileContent: async (
    sessionId: string,
    filePath: string
  ): Promise<string> => {
    const response = await apiClient.get(`/sessions/${sessionId}/file`, {
      params: { path: filePath },
    });
    return response.data.data.content;
  },

  // --- 코멘트 관련 메서드 추가 ---
  getComments: async (sessionId: string): Promise<Comment[]> => {
    const response = await apiClient.get(`/sessions/${sessionId}/comments`);
    return response.data.data;
  },

  createComment: async (
    sessionId: string,
    data: {
      filePath: string;
      startLine: number;
      endLine: number;
      content: string;
      parentComment?: string;
    }
  ): Promise<Comment> => {
    const response = await apiClient.post(
      `/sessions/${sessionId}/comments`,
      data
    );
    return response.data.data;
  },

  updateComment: async (
    sessionId: string,
    commentId: string,
    data: { content?: string; resolved?: boolean }
  ): Promise<Comment> => {
    const response = await apiClient.patch(
      `/sessions/${sessionId}/comments/${commentId}`,
      data
    );
    return response.data.data;
  },
};
