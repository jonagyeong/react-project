import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Router, Routes, Route import
import MainPage from './pages/MainPage'; // MainPage 컴포넌트
import Login from './pages/Login'
import Join from './pages/Join';
import MyPage from './pages/MyPage';
import SettingPage from './pages/SettingPage';
import DmPage from './pages/DmPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />  
        <Route path="/main" element={<MainPage />} /> 
        <Route path="/join" element={<Join />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/settingpage" element={<SettingPage />} />
        <Route path="/dmpage" element={<DmPage />} />
        <Route path="/resetpasssword" element={<ResetPasswordPage />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
