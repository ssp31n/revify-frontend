import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    // [수정] '/login' 대신 '/' (홈)으로 리다이렉트
    // state={{ from: location }}을 남겨두면, 나중에 로그인 완료 후 원래 가려던 페이지로 다시 보내줄 수 있습니다.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
