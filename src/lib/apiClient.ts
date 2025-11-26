import axios from "axios";

const apiClient = axios.create({
  // Docker 환경에서는 브라우저가 http://localhost/api/... 로 요청을 보냄
  baseURL: "/api",
  withCredentials: true,
});

export default apiClient;
