import React, { useState } from 'react';
import useQuizStore from '../store';
import { motion } from 'framer-motion';
import AnimatedText from './AnimatedText';

interface PrivacyPageProps {
  quizId: string;
}

const PrivacyPage: React.FC<PrivacyPageProps> = ({ quizId }) => {
  const { nextQuestion, previousQuestion } = useQuizStore();
  const [isAgreed, setIsAgreed] = useState(false);

  return (
    <div className="flex flex-col h-full p-6 md:px-8 pt-8 md:pb-16">
      <div className="flex-grow">
        <AnimatedText
          text="First, let's learn a little bit about you"
          el="h1"
          className="text-[34px] md:text-5xl font-light mb-8"
          animationType="word"
          style={{ lineHeight: '1.1em', paddingBottom: '5px' }}
        />
        <AnimatedText
          text="We take privacy very seriously. We always anonymize your data before using it with any AI models, and will never share it with anyone without your explicit permission."
          el="p"
          className="text-gray-600"
          animationType="word"
          delay={1}
          stagger={0.0625}
          duration={0.375}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 2 }}
          className="flex justify-left items-center mt-8 text-left"
        >
          <input
            type="checkbox"
            id="privacy-consent"
            checked={isAgreed}
            onChange={() => setIsAgreed(!isAgreed)}
            className="h-6 w-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="privacy-consent" className="ml-5 text-gray-700 leading-tight">
            I understand and accept the{' '}
            <a
              href="https://longevity.direct/privacy-policy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              data privacy policy
            </a>
            .
          </label>
        </motion.div>
      </div>
      <div className="flex justify-between items-center mt-auto">
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
            onClick={() => nextQuestion(quizId)}
            disabled={!isAgreed}
            className={`w-full text-white font-bold py-3 px-8 rounded-full transition-colors duration-300 ${isAgreed ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
                }`}
            >
            Continue
            </button>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPage;
