import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LongevityQuizPage from "./pages/LongevityQuiz/LongevityQuizPage";
import CardiacHealthQuizPage from "./pages/CardiacHealthQuiz/CardiacHealthQuizPage";
import Header from "./components/Header";
import useQuizStore from "./store";
import { questions as longevityQuestions } from "./pages/LongevityQuiz/questions";
import { questions as cardiacQuestions } from "./pages/CardiacHealthQuiz/questions";
import "./App.css";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import ResultsPage from './pages/ResultsPage/ResultsPage';
import LoadingDots from './components/LoadingDots';

const AppShell: React.FC = () => {
  const { authToken, fetchSubmissions, fetchUser, isFetchingSubmissions, isFetchingUser } = useQuizStore();
  const location = useLocation();

  useEffect(() => {
    if (authToken) {
      // Fire once (store has single-flight + throttle)
      fetchUser();
      fetchSubmissions();
    }
  }, [authToken, fetchSubmissions, fetchUser]);

  const hideHeader = location.pathname === '/login';

  return (
    <div className="max-w-[650px] w-full mx-auto h-[100dvh] flex flex-col text-gray-800">
      {!hideHeader && <Header />}
      <main className="flex-grow flex flex-col">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/longevity-quiz" element={<LongevityQuizPage />} />
          <Route path="/cardiac-health-quiz" element={<CardiacHealthQuizPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/results/:submissionId" element={<ResultsPage />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

export default App; 