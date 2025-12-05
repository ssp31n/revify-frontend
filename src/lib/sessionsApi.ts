import apiClient from "./apiClient";

// [중요] FileNode 인터페이스 정의 및 Export
export interface FileNode {
  path: string;
  name: string;
  isDirectory: boolean;
  size: number;
  language?: string;
}

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
  inviteToken?: string;
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
  // 세션 목록 조회
  getSessions: async (): Promise<Session[]> => {
    const response = await apiClient.get("/sessions");
    return response.data.data;
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

  // 세션 상세 조회
  getSessionById: async (id: string): Promise<Session> => {
    const response = await apiClient.get(`/sessions/${id}`);
    return response.data.data;
  },

  // 세션 설정 수정
  updateSessionSettings: async (
    id: string,
    data: Partial<CreateSessionData>
  ): Promise<Session> => {
    const response = await apiClient.patch(`/sessions/${id}/settings`, data);
    return response.data.data;
  },

  // 파일 업로드
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
        headers: { "Content-Type": undefined },
      }
    );
    return response.data.data;
  },

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

  // 코멘트 목록 조회
  getComments: async (sessionId: string): Promise<Comment[]> => {
    const response = await apiClient.get(`/sessions/${sessionId}/comments`);
    return response.data.data;
  },

  // 코멘트 생성
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

  // 코멘트 수정/해결
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

  // 초대 토큰 조회
  getInviteToken: async (sessionId: string): Promise<string | null> => {
    const response = await apiClient.get(`/sessions/${sessionId}/invite-token`);
    return response.data.data.inviteToken;
  },

  // 초대 토큰 생성/갱신
  refreshInviteToken: async (sessionId: string): Promise<string> => {
    const response = await apiClient.post(
      `/sessions/${sessionId}/invite-token`
    );
    return response.data.data.inviteToken;
  },

  // 초대 수락 (세션 참여)
  joinSession: async (token: string): Promise<{ sessionId: string }> => {
    const response = await apiClient.post(`/sessions/join/${token}`);
    return response.data.data;
  },
};
