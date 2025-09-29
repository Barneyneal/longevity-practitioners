import React from 'react';
import curriculumData from '../../../CuriculumBreakdown.json';
import AnimatedText from '../../components/AnimatedText';
import ModuleAccordion from '../../components/ModuleAccordion';
import { motion } from 'framer-motion';

const MasteringHealthspanFrameworkPage: React.FC = () => {
  const courseTitle = curriculumData.curriculumTitle;
  const courseSubtext = "The complete, evidence-based curriculum for professionals dedicated to extending healthy human life.";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.5,
        staggerChildren: 0.3
      }
    }
  };

  return (
    <div className="w-full mx-auto p-6">
      <div className="text-left mb-12">
        <AnimatedText
            el="h1"
            text={courseTitle}
            animationType="word"
            className="text-[34px] md:text-4xl font-light mb-2"
            style={{ lineHeight: '1.2em', paddingBottom: '20px' }}
        />
        <AnimatedText
            key="curriculum-subtitle"
            text={courseSubtext}
            el="p"
            className="text-gray-600"
            animationType="word"
            delay={1}
            stagger={0.0625}
            duration={0.375}
        />
      </div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
          {curriculumData.modules.map((module) => (
              <ModuleAccordion key={module.moduleNumber} module={module} />
          ))}
      </motion.div>
    </div>
  );
};

export default MasteringHealthspanFrameworkPage; 