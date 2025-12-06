import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider } from "@/context/AuthContext";
import Layout from "@/components/Layout";

const HomePage = lazy(() => import("@/pages/HomePage"));
const SessionsPage = lazy(() => import("@/pages/SessionsPage"));
const SessionDetailPage = lazy(() => import("@/pages/SessionDetailPage"));
const JoinSessionPage = lazy(() => import("@/pages/JoinSessionPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/join/:token" element={<JoinSessionPage />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="sessions" element={<SessionsPage />} />
              <Route path="sessions/:id" element={<SessionDetailPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
