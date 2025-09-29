import React from 'react';
import useQuizStore from '../store';
import { motion } from 'framer-motion';
import AnimatedText from './AnimatedText';
import { useNavigate } from 'react-router-dom';

interface TitlePageProps {
  quizId: string;
  title?: string;
  subtext?: string;
  onStart?: () => void; // Add onStart prop
}

const TitlePage: React.FC<TitlePageProps> = ({ quizId, title, subtext, onStart }) => {
  const { nextQuestion } = useQuizStore();
  const navigate = useNavigate();

  const handleStart = () => {
    if (onStart) {
      onStart();
    } else {
      nextQuestion(quizId);
    }
  };

  return (
    <div className="flex flex-col h-full p-6 md:px-8 md:pb-16 text-center">
      <div className="flex-grow">
        <AnimatedText
          key="title-text"
          text={title || ''}
          el="h1"
          className="text-[34px] md:text-5xl font-light mb-8"
          animationType="word"
          style={{ lineHeight: '1.1em', paddingBottom: '10px' }}
        />
        <AnimatedText
          key="subtitle-text"
          text={subtext || ''}
          el="p"
          className="text-gray-600"
          animationType="word"
          delay={1}
          stagger={0.0625}
          duration={0.375}
        />
      </div>
      <div className="flex justify-between items-center mt-auto pt-6">
        <button onClick={() => navigate('/')} className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="flex-grow ml-4"
        >
          <button
            onClick={handleStart}
            className="w-full border rounded-full text-center transition-colors bg-blue-600 text-white border-blue-600 hover:bg-blue-700 py-3 px-8 font-semibold"
          >
            Start
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default TitlePage; 