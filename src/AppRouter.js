import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Router, Routes, Route import
import MainPage from './pages/MainPage'; // MainPage 컴포넌트
import Login from './pages/Login'; // Login 컴포넌트
import Join from './pages/Join';

function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />  {/* 기본 경로는 로그인 페이지 */}
        <Route path="/main" element={<MainPage />} />  {/* 로그인 후 이동할 메인 페이지 */}
        <Route path="/join" element={<Join />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
