import React, { useState } from 'react';
import useQuizStore from '../store';
import { motion } from 'framer-motion';
import AnimatedText from './AnimatedText';
import InlineSpinner from './InlineSpinner';
import { useNavigate } from 'react-router-dom';

interface SectionTitlePageProps {
  quizId: string;
  text: string;
  subtext?: string;
  citation?: string;
  submitOnContinue?: boolean;
}

const SectionTitlePage: React.FC<SectionTitlePageProps> = ({ quizId, text, subtext, citation, submitOnContinue }) => {
  const { nextQuestion, submitQuiz } = useQuizStore();
  const navigate = useNavigate();

  const subtextDelay = 1;
  const subtextStagger = 0.0625;
  const subtextDuration = 0.375;

  const subtextWordCount = subtext ? subtext.split(' ').filter(Boolean).length : 0;
  
  // Calculate delay for citation to appear after subtext animation completes
  const citationDelay = subtextWordCount > 0 
    ? subtextDelay + (subtextWordCount * subtextStagger) + subtextDuration - 0.3
    : subtextDelay;

  const handleContinue = () => {
    if (submitOnContinue) {
      submitQuiz(quizId).catch(err => {
        console.error("Background quiz submission failed:", err);
      });
      navigate('/mastering-longevity');
    } else {
      nextQuestion(quizId);
    }
  };

  return (
    <div className="flex-grow flex flex-col h-full p-6 md:px-8 md:pb-16 text-center justify-center">
      <div className="flex-grow flex flex-col justify-center">
        <AnimatedText
          text={text}
          el="h1"
          className="text-[34px] md:text-4xl font-light mb-4"
          animationType="word"
          style={{ lineHeight: '1.2em' }}
        />
        {subtext && (
          <AnimatedText
            text={subtext}
            el="p"
            className="text-gray-600 mt-4"
            animationType="word"
            delay={1}
            stagger={0.0625}
            duration={0.375}
          />
        )}
        {citation && <p className="text-sm text-gray-400 mt-4">{citation}</p>}
      </div>
      <div className="mt-auto pt-6 w-full">
        <button
          type="button"
          onClick={handleContinue}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full transition-colors duration-300"
        >
          {submitOnContinue ? 'Submit' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default SectionTitlePage; 