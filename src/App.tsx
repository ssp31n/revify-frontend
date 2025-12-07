// src/App.tsx (수정)
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute"; // 1. ProtectedRoute 임포트

const HomePage = lazy(() => import("@/pages/HomePage"));
const SessionsPage = lazy(() => import("@/pages/SessionsPage"));
const SessionDetailPage = lazy(() => import("@/pages/SessionDetailPage"));
const JoinSessionPage = lazy(() => import("@/pages/JoinSessionPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));
// 2. 로그인 페이지 임포트
const LoginPage = lazy(() => import("@/pages/LoginPage"));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/join/:token" element={<JoinSessionPage />} />

            {/* 3. 로그인 페이지 라우트 추가 (Layout 밖이나 안, 원하시는 곳에 배치) */}
            <Route path="/login" element={<LoginPage />} />

            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />

              {/* 4. 보호된 라우트 설정 */}
              <Route element={<ProtectedRoute />}>
                <Route path="sessions" element={<SessionsPage />} />
                <Route path="sessions/:id" element={<SessionDetailPage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
