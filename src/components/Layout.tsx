import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = () => {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      <Navbar />
      {/* 기존: w-full max-w-6xl mx-auto p-4 md:p-6
        변경: w-full flex-1 (패딩과 너비 제한 제거하여 하위 페이지가 제어)
      */}
      <main className="w-full flex-1 flex flex-col relative overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
