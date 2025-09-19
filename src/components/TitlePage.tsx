import React from 'react';
import useQuizStore from '../store';
import { motion } from 'framer-motion';
import AnimatedText from './AnimatedText';
import { useNavigate } from 'react-router-dom';

interface TitlePageProps {
  quizId: string;
  title?: string;
}

const TitlePage: React.FC<TitlePageProps> = ({ quizId, title }) => {
  const { nextQuestion } = useQuizStore();
  const navigate = useNavigate();
  const defaultTitle = "The most advanced self-assessment tool for estimating your biological age";

  return (
    <div className="flex flex-col h-full p-6 md:px-8 pt-8 md:pb-16">
      <div className="flex-grow">
        <AnimatedText
          key="title-text"
          text={title || defaultTitle}
          el="h1"
          className="text-[34px] md:text-5xl font-light mb-8"
          animationType="word"
          style={{ lineHeight: '1.1em', paddingBottom: '10px' }}
        />
        <AnimatedText
          key="subtitle-text"
          text="This free quiz takes just 10–15 minutes to complete. The Longevity AI uses your responses to generate a science-backed biological age estimate — the more thoroughly you answer, the more precise and actionable your results will be.<br /><br />Built by Longr and shaped by insights from thousands of research papers, it’s one of the most robust self-reporting tools available."
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
            onClick={() => {
              if (quizId === 'cardiac_health') {
                nextQuestion(quizId);
                nextQuestion(quizId);
              } else {
                nextQuestion(quizId);
              }
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-colors duration-300"
          >
            Continue
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default TitlePage; 