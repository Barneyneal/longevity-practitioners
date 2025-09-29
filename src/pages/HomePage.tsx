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
  const { startQuiz, resetQuiz, submissions, authToken, logout, isFetchingSubmissions } = useQuizStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (authToken) {
      // No longer fetching submissions on home page load
    }
  }, [authToken]);

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

  const buttonContainerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 1.5
      },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    },
  };

  return (
    <div className="flex flex-col h-full p-6 md:px-8 md:pb-16">
      <div className="flex-grow">
        <div>
          <AnimatedText
            key="home-title"
            text="Revolutionize your practice and master the science of healthspan"
            el="h1"
            className="text-[34px] md:text-5xl font-light mb-2"
            animationType="word"
            delay={0.5}
            duration={0.8}
            style={{ lineHeight: '1.1em', paddingBottom: '20px' }}
          />
          <AnimatedText
            key="home-subtitle"
            text="The definitive, evidence-based curriculum for professionals dedicated to extending healthy human life. Built for health coaches, nutritionists, and clinicians seeking to integrate cutting-edge longevity science into their practice."
            el="p"
            className="text-gray-600"
            animationType="word"
            delay={1}
            stagger={0.0625}
            duration={0.5}
          />
        </div>
      </div>
      <motion.div
        variants={buttonContainerVariants}
        initial="hidden"
        animate="visible"
        className="mt-auto pt-6"
      >
        {authToken ? (
          <div className="flex flex-col gap-4">
            <motion.div variants={buttonVariants}>
              <Link to="/dashboard" className="block w-full">
                <button className="w-full border rounded-full text-center transition-colors bg-blue-600 text-white border-blue-600 hover:bg-blue-700 py-3 px-8 font-semibold">
                  Dashboard
                </button>
              </Link>
            </motion.div>
            <motion.div variants={buttonVariants}>
              <button
                onClick={logout}
                className="w-full border rounded-full text-center transition-colors bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 py-3 px-8 font-semibold"
              >
                Logout
              </button>
            </motion.div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <motion.div variants={buttonVariants}>
              <Link to="/onboarding" className="block w-full">
                <button className="w-full border rounded-full text-center transition-colors bg-blue-600 text-white border-blue-600 hover:bg-blue-700 py-3 px-8 font-semibold">Start Now</button>
              </Link>
            </motion.div>
            <motion.div variants={buttonVariants}>
              <Link to="/login" className="block w-full">
                <button className="w-full border rounded-full text-center transition-colors bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 py-3 px-8 font-semibold">Login</button>
              </Link>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default HomePage; 