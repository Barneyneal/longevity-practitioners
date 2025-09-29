import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useQuizStore from '../store';
import Logo from './Logo';

const Header: React.FC = () => {
    const { quizzes, currentQuizId } = useQuizStore();
    const location = useLocation();
    const navigate = useNavigate();

    const currentQuizState = currentQuizId ? quizzes[currentQuizId] : undefined;
    const totalQuestions = currentQuizState?.questions.length ?? 0;
    const currentQuestionIndex = currentQuizState?.currentQuestion ?? -1;

    const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

    const showProgressBar =
        location.pathname.startsWith('/onboarding') ||
        location.pathname.startsWith('/mastering-longevity');

    const isResultsPage = location.pathname.startsWith('/results');
    const isDashboardPage = location.pathname.startsWith('/dashboard');
    const isCoursePage = location.pathname.startsWith('/mastering-longevity');

    const handleBack = () => {
        if (isCoursePage) {
            navigate('/dashboard');
        } else if (isDashboardPage) {
            navigate('/');
        } else {
            navigate(-1);
        }
    };

    return (
        <header className="px-2 pt-2 md:px-4 md:pt-4 flex flex-col items-start">
            <div className="w-full h-6">
                {showProgressBar && (
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{ width: `${progress}%`, transition: 'width 0.3s ease-in-out' }}
                        ></div>
                    </div>
                )}
            </div>
            {(isResultsPage || isDashboardPage || isCoursePage) ? (
                <div className="w-full flex items-center justify-between">
                    <div style={{ marginLeft: '-10px' }}>
                        <Logo />
                    </div>
                    <button
                        aria-label="Go back"
                        onClick={handleBack}
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