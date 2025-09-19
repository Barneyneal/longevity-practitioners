import React from 'react';
import useQuizStore from '../store';
import Logo from './Logo';
import { useLocation, useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { progress, activeQuiz } = useQuizStore();
  const location = useLocation();
  const navigate = useNavigate();

  const showProgressBar = activeQuiz && (location.pathname.includes('/longevity-quiz') || location.pathname.includes('/cardiac-health-quiz'));
  const isResultsPage = location.pathname.startsWith('/results');
  const isDashboardPage = location.pathname.startsWith('/dashboard');

  return (
    <header className="px-2 pt-2 md:px-4 md:pt-4 flex flex-col items-start">
      <div className="w-full h-6">
        {showProgressBar && (
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 rounded-full h-2 transition-all duration-500 ease-in-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
      </div>
      {(isResultsPage || isDashboardPage) ? (
        <div className="w-full flex items-center justify-between">
          <div style={{ marginLeft: '-10px' }}>
            <Logo />
          </div>
          <button
            aria-label="Go back"
            onClick={() => navigate(-1)}
            className="h-10 w-10 rounded-full bg-white border border-gray-300 shadow flex items-center justify-center text-gray-700 hover:bg-gray-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>
      ) : (
        <div style={{ marginLeft: '-10px' }}>
          <Logo />
        </div>
      )}
    </header>
  );
};

export default Header; 