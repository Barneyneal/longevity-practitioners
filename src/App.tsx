import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ResultsPage from './pages/ResultsPage/ResultsPage';
import ProtectedRoute from './components/ProtectedRoute';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import OnboardingPage from "./pages/Onboarding/OnboardingPage";
import MasteringHealthspanFrameworkPage from "./pages/MasteringHealthspanFramework/MasteringHealthspanFrameworkPage";
import LessonSlidePage from './pages/LessonSlidePage';

import { Toaster } from 'react-hot-toast';

const MainLayout: React.FC = () => (
  <div className="max-w-[650px] w-full mx-auto h-[100dvh] flex flex-col text-gray-800">
    <Header />
    <main className="flex-grow flex flex-col">
      <Outlet />
    </main>
  </div>
);

function App() {
  return (
    <>
      <Toaster position="bottom-center" />
      <Routes>
        {/* Full screen lesson page route */}
        <Route path="/course/:moduleSlug/:lessonSlug" element={<LessonSlidePage />} />

        {/* Auth routes without main layout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* Main application routes with shared layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/mastering-longevity" element={<MasteringHealthspanFrameworkPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/results/:submissionId" element={<ResultsPage />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App; 