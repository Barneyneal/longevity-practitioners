import React from 'react';
import AnimatedText from './AnimatedText';
import { motion } from 'framer-motion';
import useQuizStore from '../store';
import { useNavigate } from 'react-router-dom';

interface ThankYouPageProps {
  quizId: string;
}

const ThankYouPage: React.FC<ThankYouPageProps> = ({ quizId }) => {
  const { resetQuiz } = useQuizStore();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full p-6 md:px-8 pt-8 md:pb-16">
      <div className="flex-grow">
        <AnimatedText
          text="Your results are being analysed and will be sent to you via email shortly."
          el="h1"
          className="text-[34px] md:text-5xl font-light mb-8"
          animationType="word"
          style={{ lineHeight: '1.1em', paddingBottom: '10px' }}
        />
        <AnimatedText
          text="While you wait for your results, now’s a great time to explore the protocols already helping thousands slow biological aging — from metabolic regulation to cellular repair. Each treatment is reviewed by a licensed US physician and grounded in clinical science."
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
          className="mt-6 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4"
        >
          <a
            href="https://longevity.direct"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white text-center py-3 px-8 rounded-full transition-colors duration-300"
          >
            View treatments
          </a>
          <a
            href="https://longevity.direct"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-red-600 hover:bg-red-700 text-white text-center py-3 px-8 rounded-full transition-colors duration-300"
          >
            Longevity Direct
          </a>
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 2.2 }}
        className="mt-auto"
      >
        <button
          onClick={() => { resetQuiz(quizId); navigate('/'); }}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-colors duration-300"
        >
          Return Home
        </button>
      </motion.div>
    </div>
  );
};

export default ThankYouPage; 