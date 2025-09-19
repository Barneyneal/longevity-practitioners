import React from 'react';
import useQuizStore from '../store';
import { motion } from 'framer-motion';
import AnimatedText from './AnimatedText';

interface SectionTitlePageProps {
  quizId: string;
  text: string;
  subtext?: string;
  citation?: string;
  submitOnContinue?: boolean;
}

const SectionTitlePage: React.FC<SectionTitlePageProps> = ({ quizId, text, subtext, citation, submitOnContinue }) => {
  const { nextQuestion, previousQuestion, submitQuiz } = useQuizStore();

  const subtextDelay = 1;
  const subtextStagger = 0.0625;
  const subtextDuration = 0.375;

  const subtextWordCount = subtext ? subtext.split(' ').filter(Boolean).length : 0;
  
  // Calculate delay for citation to appear after subtext animation completes
  const citationDelay = subtextWordCount > 0 
    ? subtextDelay + (subtextWordCount * subtextStagger) + subtextDuration - 0.3
    : subtextDelay;

  return (
    <div className="flex flex-col h-full p-6 md:px-8 pt-8 md:pb-16">
      <div className="flex-grow">
        <AnimatedText
          text={text}
          el="h1"
          className="text-[34px] md:text-5xl font-light mb-4 md:mb-8"
          animationType="word"
          style={{ lineHeight: '1.1em', paddingBottom: '20px' }}
        />
        <AnimatedText
          text={subtext || ''}
          el="p"
          className="text-gray-600"
          animationType="word"
          delay={1}
          stagger={0.0625}
          duration={0.375}
        />
        {citation && (
            <AnimatedText
                text={citation}
                el="p"
                className="text-gray-500 text-sm italic mt-4"
                animationType="word"
                delay={citationDelay}
                stagger={0.0625}
                duration={0.375}
            />
        )}
      </div>
      <div className="flex justify-between items-center mt-auto pt-6">
        <button onClick={() => previousQuestion(quizId)} className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-300">
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
            onClick={async () => { if (submitOnContinue) { await submitQuiz(quizId); } nextQuestion(quizId); }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-colors duration-300"
          >
            Continue
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default SectionTitlePage; 