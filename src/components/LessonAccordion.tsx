import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

interface Lesson {
    lessonTitle: string;
    lessonSlug: string;
    durationMinutes: number;
    topicsCovered: string[];
}

interface LessonAccordionProps {
    lesson: Lesson;
    moduleSlug: string;
}

const LessonAccordion: React.FC<LessonAccordionProps> = ({ lesson, moduleSlug }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-t border-gray-200">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center py-4 px-5 text-left"
            >
                <div className="flex items-center gap-4">
                    {/* Status Icon Placeholder */}
                    <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                    <span className="font-medium text-gray-600">{lesson.lessonTitle}</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-gray-500 text-sm">{lesson.durationMinutes} min</span>
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
                        className="pl-[3.25rem] pr-5 pb-4 overflow-hidden"
                    >
                        <ul className="list-disc text-gray-600 space-y-2 mt-2 mb-6 text-left">
                            {lesson.topicsCovered.map((topic, index) => (
                                <li key={index}>{topic}</li>
                            ))}
                        </ul>
                        <div className="flex items-center gap-2.5">
                            <Link to={`/course/${moduleSlug}/${lesson.lessonSlug}/quiz`} className="w-1/2">
                                <button className="w-full bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-full hover:bg-gray-300 transition-colors">
                                    Take Quiz
                                </button>
                            </Link>
                            <Link to={`/course/${moduleSlug}/${lesson.lessonSlug}`} className="w-1/2">
                                <button className="w-full bg-blue-600 text-white font-semibold py-2 px-6 rounded-full hover:bg-blue-700 transition-colors">
                                    Start Now
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LessonAccordion;
