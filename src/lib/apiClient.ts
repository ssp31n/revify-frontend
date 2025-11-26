import axios from "axios";

const apiClient = axios.create({
  // 환경변수가 없으면 기본 로컬호스트 사용
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  // 쿠키(세션)를 주고받기 위해 필수
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
