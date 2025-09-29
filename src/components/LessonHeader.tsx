import React from 'react';
import Logo from './Logo';

const LessonHeader: React.FC<{ lessonTitle: string; onBack: () => void; }> = ({ lessonTitle, onBack }) => {
    return (
        <header className="h-20 bg-white/80 backdrop-blur-sm border-b border-gray-200 flex items-center px-8 flex-shrink-0">
            <div className="flex items-center gap-4">
                <Logo className="!h-16" />
                <button
                    aria-label="Go back to course curriculum"
                    onClick={onBack}
                    className="h-10 w-10 rounded-full bg-white border border-gray-300 shadow flex items-center justify-center text-gray-700 hover:bg-gray-50 flex-shrink-0"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>
                <h1 className="font-semibold text-gray-800 text-lg whitespace-nowrap">{lessonTitle}</h1>
            </div>
        </header>
    );
};

export default LessonHeader;
