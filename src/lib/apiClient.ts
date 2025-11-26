import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  // 중요: 브라우저가 세션 쿠키를 백엔드로 전송하도록 설정
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// 보안 참고:
// HttpOnly 쿠키를 사용하므로 XSS 공격으로 토큰이 탈취될 위험은 낮습니다.
// 하지만 CSRF 공격 위험이 있으므로, 추후 백엔드에서 CSRF Token을 발급하고
// 프론트엔드가 이를 헤더에 포함하는 로직이 추가될 수 있습니다. (현재 단계는 생략)

export default apiClient;
