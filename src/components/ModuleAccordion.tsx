import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LessonAccordion from './LessonAccordion';

interface Lesson {
    lessonTitle: string;
    durationMinutes: number;
    topicsCovered: string[];
}

interface Module {
    moduleNumber: number;
    title: string;
    moduleSlug: string;
    totalDurationMinutes: number;
    lessons: Lesson[];
}

interface ModuleAccordionProps {
    module: Module;
}

const moduleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.5 }
    }
};

const ModuleAccordion: React.FC<ModuleAccordionProps> = ({ module }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.div 
            variants={moduleVariants}
            className="bg-white rounded-2xl border border-gray-300 overflow-hidden"
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-5 text-left"
            >
                <h2 className="text-xl font-semibold text-gray-800">{module.moduleNumber}. {module.title}</h2>
                <div className="flex items-center gap-4">
                    <div className="text-right text-gray-500 text-sm">
                        <div>{module.lessons.length} Lessons</div>
                        <div>{module.totalDurationMinutes} min</div>
                    </div>
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Replace with an actual chevron icon later */}
                        <span>▼</span>
                    </motion.div>
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={{
                            open: { opacity: 1, height: 'auto' },
                            collapsed: { opacity: 0, height: 0 }
                        }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div>
                            {module.lessons.map((lesson, index) => (
                                <LessonAccordion key={index} lesson={lesson} moduleSlug={module.moduleSlug} />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ModuleAccordion;
