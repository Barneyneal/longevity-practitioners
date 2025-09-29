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
import LessonQuizPage from './pages/LessonQuizPage';

import { Toaster } from 'react-hot-toast';
import useQuizStore from './store';

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
        {/* Main application routes with shared layout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="onboarding" element={<OnboardingPage />} />
          <Route path="results/:submissionId" element={<ResultsPage />} />
          <Route path="mastering-longevity" element={<MasteringHealthspanFrameworkPage />} />
          <Route path="course/:moduleSlug/:lessonSlug/quiz" element={<LessonQuizPage />} />
        </Route>

        {/* Full screen lesson page route */}
        <Route path="/course/:moduleSlug/:lessonSlug" element={<LessonSlidePage />} />

        {/* Auth routes without main layout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    </>
  );
}

export default App; 