import React from 'react';
import { motion } from 'framer-motion';

const LoadingDots: React.FC = () => {
  const containerVariants = {
    start: {
      transition: {
        staggerChildren: 0.2,
      },
    },
    end: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const dotVariants = {
    start: {
      y: '0%',
    },
    end: {
      y: '100%',
    },
  };

  const dotTransition = {
    duration: 0.5,
    repeat: Infinity,
    repeatType: 'reverse' as const,
    ease: 'easeInOut',
  };

  return (
    <div className="flex justify-center items-start pt-32 h-full">
        <motion.div
        className="flex space-x-2"
        variants={containerVariants}
        initial="start"
        animate="end"
        >
        <motion.span
            className="block w-4 h-4 bg-gray-600 rounded-full"
            variants={dotVariants}
            transition={dotTransition}
        />
        <motion.span
            className="block w-4 h-4 bg-gray-600 rounded-full"
            variants={dotVariants}
            transition={dotTransition}
        />
        <motion.span
            className="block w-4 h-4 bg-gray-600 rounded-full"
            variants={dotVariants}
            transition={dotTransition}
        />
        </motion.div>
    </div>
  );
};

export default LoadingDots;
