import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useQuizStore from '../store';
import AnimatedText from './AnimatedText';
import { motion } from 'framer-motion';

interface QuestionProps {
  quizId: string;
  questionId: string;
  questionText: string;
  questionType: 'text' | 'number' | 'dropdown' | 'slider' | 'multi-choice' | 'date' | 'height' | 'name' | 'email' | 'password';
  options?: string[];
  onSubmit?: (answer: { questionId: string; value: string | number | string[] }) => void;
  min?: number;
  max?: number;
  subtext?: string;
  sliderLabels?: string[];
  isLastQuestion: boolean;
  isLessonQuiz?: boolean;
}

const getInitialValue = (type: QuestionProps['questionType'], min?: number) => {
  switch (type) {
    case 'name':
      return { firstName: '', lastName: '' };
    case 'height':
      return { ft: '', in: '' };
    case 'slider':
        return min || 0;
    default:
      return '';
  }
};

const Question: React.FC<QuestionProps> = ({
  quizId,
  questionId,
  questionText,
  questionType,
  options,
  min,
  max,
  subtext,
  sliderLabels,
  isLastQuestion,
  isLessonQuiz,
}) => {
  const { submitAnswer, previousQuestion, quizzes } = useQuizStore();
  const navigate = useNavigate();
  const { answers, currentQuestion } = quizzes[quizId];
  const [value, setValue] = useState<any>(
    answers[questionId] || getInitialValue(questionType, min)
  );
  const [hasEmailBeenTouched, setHasEmailBeenTouched] = useState(false);

  const isEmailValid = (email: string): boolean => {
    if (!email) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };
  const isPasswordValid = (pw: string): boolean => {
    return typeof pw === 'string' && pw.length >= 8;
  };

  const showEmailError = questionType === 'email' && hasEmailBeenTouched && !isEmailValid(value);

  const requiresValidation = questionType === 'email' || questionType === 'password';
  const isValueValid = questionType === 'email' ? isEmailValid(value) : questionType === 'password' ? isPasswordValid(value) : true;
  const isDisabled = requiresValidation && !isValueValid;

  const handleSubmit = (event?: React.FormEvent) => {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    if (isDisabled) return;
    submitAnswer(quizId, questionId, value);
  };

  const renderInput = () => {
    const containerAnimation = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
          delayChildren: 0.4,
        },
      },
    };

    const itemAnimation = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.5,
        },
      },
    };

    switch (questionType) {
      case 'name':
        return (
          <motion.div
            variants={containerAnimation}
            initial="hidden"
            animate="visible"
            className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:gap-4"
          >
            <motion.input
              variants={itemAnimation}
              type="text"
              placeholder="First Name"
              value={value.firstName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue({ ...value, firstName: e.target.value })}
              className="p-4 w-full md:w-1/2 border border-gray-300 rounded-full focus:outline-none focus:ring-0 focus:border-gray-300 text-gray-500"
            />
            <motion.input
              variants={itemAnimation}
              type="text"
              placeholder="Last Name"
              value={value.lastName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue({ ...value, lastName: e.target.value })}
              className="p-4 w-full md:w-1/2 border border-gray-300 rounded-full focus:outline-none focus:ring-0 focus:border-gray-300 text-gray-500"
            />
          </motion.div>
        );
      case 'email':
        return (
          <motion.div variants={containerAnimation} initial="hidden" animate="visible">
            <motion.input
              variants={itemAnimation}
              type="email"
              placeholder="Email"
              value={value as string}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
              onBlur={() => setHasEmailBeenTouched(true)}
              className={`mt-2 p-3 border rounded-full w-full focus:outline-none focus:ring-0 text-gray-500 ${showEmailError ? 'border-red-500' : 'border-gray-300'}`}
              autoFocus
            />
            {showEmailError && (
              <p className="text-red-500 text-sm mt-2 text-left">Please enter a valid email address.</p>
            )}
          </motion.div>
        );
      case 'password':
        return (
          <motion.div variants={containerAnimation} initial="hidden" animate="visible">
            <motion.input
              variants={itemAnimation}
              type="password"
              placeholder="Password (min 8 characters)"
              value={value as string}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
              className="mt-2 p-3 border rounded-full w-full focus:outline-none focus:ring-0 text-gray-500 border-gray-300"
              autoFocus
            />
          </motion.div>
        );
      case 'height':
        return (
          <motion.div
            variants={containerAnimation}
            initial="hidden"
            animate="visible"
            className="flex items-center space-x-4"
          >
            <motion.input
              variants={itemAnimation}
              type="number"
              placeholder="ft"
              max="99"
              min="0"
              value={value.ft}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue({ ...value, ft: e.target.value })}
              className="p-4 w-32 border border-gray-300 rounded-full text-center focus:outline-none focus:ring-0 focus:border-gray-300 text-gray-500"
            />
            <motion.input
              variants={itemAnimation}
              type="number"
              placeholder="in"
              max="11"
              min="0"
              value={value.in}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue({ ...value, in: e.target.value })}
              className="p-4 w-32 border border-gray-300 rounded-full text-center focus:outline-none focus:ring-0 focus:border-gray-300 text-gray-500"
            />
          </motion.div>
        );
      case 'date':
        return (
          <motion.input
            variants={containerAnimation}
            initial="hidden"
            animate="visible"
            type="date"
            value={value as string}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
            className="mt-2 p-3 border border-gray-300 rounded-full w-full focus:outline-none focus:ring-0 focus:border-gray-300 text-gray-500"
            autoFocus
          />
        )
      case 'slider':
        return (
          <motion.div
            variants={containerAnimation}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center mt-24"
          >
            <motion.input
              variants={itemAnimation}
              type="range"
              min={min}
              max={max}
              value={value as number}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <motion.span variants={itemAnimation} className="mt-8 text-3xl font-normal">
                {sliderLabels ? sliderLabels[value-1] : value} {subtext}
            </motion.span>
          </motion.div>
        )
      case 'multi-choice':
        const layoutClass = (options?.length || 0) > 5
          ? 'flex flex-wrap gap-4 justify-center'
          : 'grid grid-cols-1 md:grid-cols-1 gap-4';

        return (
          <motion.div
            variants={containerAnimation}
            initial="hidden"
            animate="visible"
            className={layoutClass}
          >
            {options?.map((option) => (
              <motion.button
                variants={itemAnimation}
                key={option}
                onClick={() => {
                  submitAnswer(quizId, questionId, option);
                }}
                className={`px-4 py-3 border rounded-full text-center transition-colors
                  ${(options?.length || 0) > 5 ? 'px-9' : 'w-full'}
                  ${value === option
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-100'
                  }`}
              >
                {option}
              </motion.button>
            ))}
          </motion.div>
        )
      case 'number':
        return (
          <motion.input
            variants={containerAnimation}
            initial="hidden"
            animate="visible"
            type="number"
            value={value as number}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
            className="mt-2 p-3 border border-gray-300 rounded-full w-full focus:outline-none focus:ring-0 focus:border-gray-300 text-gray-500"
            autoFocus
          />
        )
      case 'text':
      default:
        return (
          <motion.textarea
            variants={containerAnimation}
            initial="hidden"
            animate="visible"
            value={value as string}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value)}
            className="mt-2 p-3 border border-gray-300 rounded-2xl w-full focus:outline-none focus:ring-0 focus:border-gray-300 text-gray-500"
            autoFocus
            rows={4}
          />
        )
    }
  }

  return (
    <div className="flex-grow flex flex-col h-full p-6 md:px-8 md:pb-16">
      <div className="flex-grow">
        <AnimatedText
          text={questionText}
          el="h2"
          className="text-[34px] md:text-4xl font-light mb-4"
          animationType="word"
          style={{ lineHeight: '1.2em' }}
        />
        <div className="mt-6 mb-6">
          {renderInput()}
        </div>
      </div>
      <div
        className="flex justify-between items-center mt-auto pt-6"
      >
        {currentQuestion >= 0 && (
          <button onClick={() => (isLessonQuiz && currentQuestion === 0) ? navigate('/mastering-longevity') : previousQuestion(quizId)} className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-300">
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
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isDisabled}
          className={`flex-grow ml-4 text-white font-bold py-3 px-8 rounded-full transition-colors duration-300 ${isDisabled
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
          {isLastQuestion ? 'Submit' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default Question; 