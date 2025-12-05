import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import HomePage from "@/pages/HomePage";
import SessionsPage from "@/pages/SessionsPage";
import SessionDetailPage from "@/pages/SessionDetailPage";
import JoinSessionPage from "@/pages/JoinSessionPage"; // 추가
import NotFoundPage from "@/pages/NotFoundPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Join Route는 Layout 밖에 두거나 안에 둬도 됨. 여기서는 별도 페이지로 처리 */}
          <Route path="/join/:token" element={<JoinSessionPage />} />{" "}
          {/* 추가 */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="sessions" element={<SessionsPage />} />
            <Route path="sessions/:id" element={<SessionDetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
