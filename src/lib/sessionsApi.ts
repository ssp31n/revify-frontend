import apiClient from "./apiClient";

// ... (기존 인터페이스들: Session, FileNode, Comment 등 유지) ...
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
  inviteToken?: string; // [추가됨]
}

export interface CreateSessionData {
  title: string;
  description?: string;
  visibility: "private" | "link" | "public";
  commentPermission: "owner" | "invited" | "everyone";
}

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

  // [추가됨] 세션 설정 수정 (공개 범위 등)
  updateSessionSettings: async (
    id: string,
    data: Partial<CreateSessionData>
  ): Promise<Session> => {
    const response = await apiClient.patch(`/sessions/${id}/settings`, data);
    return response.data.data;
  },

  uploadFile: async (
    sessionId: string,
    file: File
  ): Promise<{ uploadId: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    // Content-Type: undefined로 설정하여 브라우저가 boundary 자동 생성하도록 함
    const response = await apiClient.post(
      `/sessions/${sessionId}/uploads`,
      formData,
      {
        headers: { "Content-Type": undefined },
      }
    );
    return response.data.data;
  },

  getFileTree: async (sessionId: string): Promise<any[]> => {
    // FileNode[] 타입 사용 권장
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

  // [추가] 초대 토큰 조회
  getInviteToken: async (sessionId: string): Promise<string | null> => {
    const response = await apiClient.get(`/sessions/${sessionId}/invite-token`);
    return response.data.data.inviteToken;
  },

  // [추가] 초대 토큰 생성/갱신
  refreshInviteToken: async (sessionId: string): Promise<string> => {
    const response = await apiClient.post(
      `/sessions/${sessionId}/invite-token`
    );
    return response.data.data.inviteToken;
  },

  // [추가] 초대 수락 (세션 참여)
  joinSession: async (token: string): Promise<{ sessionId: string }> => {
    const response = await apiClient.post(`/sessions/join/${token}`);
    return response.data.data;
  },
};
