import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AnimatedText from '../components/AnimatedText';
import { motion } from 'framer-motion';
import useQuizStore from '../store';

function formatTimeAgo(dateString: string | undefined): string {
  if (!dateString) return 'Not completed';

  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) {
    return Math.floor(interval) + " years ago";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months ago";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days ago";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours ago";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes ago";
  }
  return "just now";
}

const HomePage: React.FC = () => {
  const { startQuiz, resetQuiz, submissions, fetchSubmissions, authToken, logout, isFetchingSubmissions } = useQuizStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (authToken) {
      fetchSubmissions();
    }
  }, [authToken, fetchSubmissions]);

  const hasCompletedLongevity = submissions.some(s => s.quizId === 'longevity');
  const hasCompletedCardiac = submissions.some(s => s.quizId === 'cardiac_health');

  const handleStartQuiz = (quizId: 'longevity' | 'cardiac_health') => {
    startQuiz(quizId);
  };

  const handleRetake = (e: React.MouseEvent, quizId: 'longevity' | 'cardiac_health') => {
    e.preventDefault();
    e.stopPropagation();
    resetQuiz(quizId);
    startQuiz(quizId);
    navigate(quizId === 'longevity' ? '/longevity-quiz' : '/cardiac-health-quiz');
  };

  const RowSkeleton = () => (
    <div className="grid grid-cols-3 gap-4 items-stretch animate-pulse">
      <div className="col-span-2 p-4 border rounded-full bg-gray-100 border-gray-200 h-full">
        <div className="flex justify-between items-center">
          <span className="h-4 w-24 bg-gray-200 rounded"></span>
          <span className="h-4 w-32 bg-gray-200 rounded"></span>
        </div>
      </div>
      <div className="col-span-1 h-full">
        <div className="w-full h-full border rounded-full bg-gray-200 border-gray-200"></div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full p-6 md:px-8 md:pb-16">
      <div className="flex-grow">
        <div>
          <AnimatedText
            key="home-title"
            text="Start your healthspan journey with personalized self-assessments"
            el="h1"
            className="text-[34px] md:text-5xl font-light mb-2"
            animationType="word"
            style={{ lineHeight: '1.1em', paddingBottom: '20px' }}
          />
          <AnimatedText
            key="home-subtitle"
            text="Each quiz in this portal is powered by The Longevity AI, developed by Longr. These science-backed tools translate your answers into meaningful insights, helping you understand your biological age, cardiac risk, and more. All assessments are free, fully anonymized, and designed to guide preventive, physician-led care."
            el="p"
            className="text-gray-600"
            animationType="word"
            delay={1}
            stagger={0.0625}
            duration={0.375}
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 2 }}
          className="mt-8 space-y-4"
        >
          {/* Longevity row */}
          {isFetchingSubmissions && !submissions.length ? (
            <RowSkeleton />
          ) : (
            <>
            <div className="grid grid-cols-3 gap-3 items-stretch">
              <div className="col-span-2 py-4 pl-5 pr-5 border rounded-full bg-white text-gray-800 border-gray-300 h-full">
                <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between">
                  <span className="font-medium text-lg md:text-lg">Longevity Quiz</span>
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    {hasCompletedLongevity
                      ? `${formatTimeAgo(submissions.find(s => s.quizId === 'longevity')?.submittedAt)}`
                      : 'Ready to start'}
                    {authToken && hasCompletedLongevity && (
                      <button
                        onClick={(e) => handleRetake(e, 'longevity')}
                        className="hidden md:inline-flex p-0 rounded-full"
                        title="Retake Quiz"
                      >
                        <img src="/retake.svg" alt="Retake" className="w-5 h-5" />
                      </button>
                    )}
                  </span>
                </div>
              </div>
              <div className="col-span-1 h-full flex items-center space-x-2">
                {hasCompletedLongevity ? (
                  <>
                    <Link to="/dashboard" className="flex-grow h-full">
                      <button className="w-full h-full border rounded-full text-center transition-colors bg-gray-200 text-gray-800 border-gray-200 flex items-center justify-center">
                        View Results
                      </button>
                    </Link>
                  </>
                ) : (
                  <Link to="/longevity-quiz" className="flex-grow h-full">
                    <button className="w-full h-full border rounded-full text-center transition-colors bg-blue-600 text-white border-blue-600 hover:bg-blue-700 flex items-center justify-center text-lg md:text-base font-medium">Start</button>
                  </Link>
                )}
              </div>
            </div>
            
            </>
          )}

          {/* Cardiac row */}
          {isFetchingSubmissions && !submissions.length ? (
            <RowSkeleton />
          ) : (
            <>
            <div className="grid grid-cols-3 gap-3 items-stretch">
              <div className={`col-span-2 py-4 pl-5 pr-5 border rounded-full h-full ${hasCompletedLongevity ? 'bg-white text-gray-800 border-gray-300' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between">
                  <span className="font-medium text-lg md:text-lg">Cardiac Health</span>
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    {hasCompletedCardiac
                      ? `${formatTimeAgo(submissions.find(s => s.quizId === 'cardiac_health')?.submittedAt)}`
                      : hasCompletedLongevity
                      ? 'Ready to start'
                      : 'Longevity first'}
                    {authToken && hasCompletedCardiac && (
                      <button
                        onClick={(e) => handleRetake(e, 'cardiac_health')}
                        className="hidden md:inline-flex p-0 rounded-full"
                        title="Retake Quiz"
                      >
                        <img src="/retake.svg" alt="Retake" className="w-5 h-5" />
                      </button>
                    )}
                  </span>
                </div>
              </div>
              <div className="col-span-1 h-full flex items-center space-x-2">
                {hasCompletedCardiac ? (
                  <>
                    <Link to="/dashboard" className="flex-grow h-full">
                      <button className="w-full h-full border rounded-full text-center transition-colors bg-gray-200 text-gray-800 border-gray-200 flex items-center justify-center">
                        View Results
                      </button>
                    </Link>
                  </>
                ) : (
                  <Link to="/cardiac-health-quiz" className="flex-grow h-full">
                    <button
                      onClick={() => handleStartQuiz('cardiac_health')}
                      disabled={!hasCompletedLongevity}
                      className="w-full h-full border rounded-full text-center transition-colors bg-blue-600 text-white border-blue-600 hover:bg-blue-700 flex items-center justify-center text-lg md:text-base font-medium disabled:bg-gray-300 disabled:border-gray-300 disabled:cursor-not-allowed"
                    >
                      Start
                    </button>
                  </Link>
                )}
              </div>
            </div>
            
            </>
          )}
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 2.5 }}
        className="mt-auto pt-6"
      >
        {authToken ? (
          <button 
            onClick={logout}
            className="w-full border rounded-full text-center transition-colors bg-gray-200 text-gray-800 border-gray-200 py-3 px-8"
          >
            Logout
          </button>
        ) : (
          <Link to="/login" className="block w-full">
            <button className="w-full border rounded-full text-center transition-colors bg-blue-600 text-white border-blue-600 hover:bg-blue-700 py-3 px-8">Login</button>
          </Link>
        )}
      </motion.div>
    </div>
  );
};

export default HomePage; 