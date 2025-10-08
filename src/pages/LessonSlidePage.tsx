import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import LessonHeader from '../components/LessonHeader';
import AudioPlayer from '../components/AudioPlayer';
import SlideContent from '../components/SlideContent';

const manifestImports = import.meta.glob<{ default: any }>('/src/course-data/**/*.json');

const citationVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.5,
            duration: 0.5,
        },
    }),
    exit: {
        opacity: 0,
        transition: { duration: 0.2 },
    },
};

interface Manifest {
    lessonTitle: string;
    slides: { 
        slideNumber: number; 
        citationIds: string[]; 
        audio: string;
        content: any; // Add content to the slide type
    }[];
}

const LessonSlidePage: React.FC = () => {
    const { moduleSlug, lessonSlug, slideNumber } = useParams<{ moduleSlug: string; lessonSlug: string; slideNumber: string }>();
    const navigate = useNavigate();

    const [manifest, setManifest] = useState<Manifest | null>(null);
    const [cumulativeCitations, setCumulativeCitations] = useState<any[]>([]);
    const [allCitations, setAllCitations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const currentSlideIndex = useMemo(() => {
        const num = parseInt(slideNumber || '1', 10);
        return Math.max(0, num - 1);
    }, [slideNumber]);

    // Effect for loading manifest and all citations (once per lesson)
    useEffect(() => {
        const loadCourseData = async () => {
            if (moduleSlug && lessonSlug) {
                try {
                    setIsLoading(true);
                    const manifestPath = `/src/course-data/${moduleSlug}/${lessonSlug}/index.json`;
                    const citationsPath = `/src/course-data/${moduleSlug}/${lessonSlug}/citations.json`;

                    if (!manifestImports[manifestPath]) throw new Error(`Manifest file not found at ${manifestPath}`);
                    const manifestModule = await manifestImports[manifestPath]();
                    setManifest(manifestModule.default as Manifest);
                    
                    if (!manifestImports[citationsPath]) throw new Error(`Citations file not found at ${citationsPath}`);
                    const citationsModule = await manifestImports[citationsPath]();
                    setAllCitations(citationsModule.default);
                    setIsLoading(false);

                } catch (error) {
                    console.error("Failed to load course manifest or citations:", error);
                    navigate('/dashboard');
                }
            }
        };

        loadCourseData();
    }, [moduleSlug, lessonSlug, navigate]);

    // Effect for loading the current slide's HTML - REMOVED

    // Effect to handle invalid slide numbers from URL
    useEffect(() => {
        if (manifest && (currentSlideIndex >= manifest.slides.length || isNaN(currentSlideIndex))) {
            navigate(`/course/${moduleSlug}/${lessonSlug}/1`, { replace: true });
        }
    }, [manifest, currentSlideIndex, moduleSlug, lessonSlug, navigate]);

    // Effect for updating cumulative citations based on current slide
    useEffect(() => {
        const loadCitations = () => {
            if (manifest) {
                const citationIdsToShow = new Set<string>();
                for (let i = 0; i <= currentSlideIndex; i++) {
                    const slideManifest = manifest.slides.find(s => s.slideNumber === i + 1);
                    if (slideManifest) {
                        slideManifest.citationIds.forEach(id => citationIdsToShow.add(id));
                    }
                }
                setCumulativeCitations(allCitations.filter(citation => citationIdsToShow.has(citation.id)));
            }
        };
        loadCitations();
    }, [manifest, currentSlideIndex, allCitations]);
 
    const lessonTitle = useMemo(() => manifest?.lessonTitle || '', [manifest]);
    const totalSlides = useMemo(() => manifest?.slides.length || 0, [manifest]);

    const goToNextSlide = () => {
        const nextSlideNumber = currentSlideIndex + 2;
        if (nextSlideNumber <= totalSlides) {
            navigate(`/course/${moduleSlug}/${lessonSlug}/${nextSlideNumber}`);
        }
    };

    const goToPreviousSlide = () => {
        const prevSlideNumber = currentSlideIndex;
        if (prevSlideNumber > 0) {
            navigate(`/course/${moduleSlug}/${lessonSlug}/${prevSlideNumber}`);
        }
    };

    if (isLoading || !manifest) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="bg-gray-100 h-screen overflow-hidden flex flex-col">
            <LessonHeader 
                lessonTitle={lessonTitle} 
                onBack={() => navigate(`/mastering-longevity`)} 
            />
            
            <div className="flex gap-4 pt-4 px-4 flex-1 min-h-0">
                <main className="flex-1 flex flex-col overflow-hidden relative bg-white rounded-2xl shadow-sm p-12">
                    <AnimatePresence mode="wait">
                        <SlideContent
                            key={currentSlideIndex}
                            content={manifest.slides[currentSlideIndex].content}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="w-full h-full"
                        />
                    </AnimatePresence>
                </main>

                <aside className="w-[400px] bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
                        <h2 className="text-xl font-semibold">Citations</h2>
                    </div>
                    <div className="overflow-y-auto flex-1 p-6">
                        <ul>
                            <AnimatePresence>
                                {cumulativeCitations.slice().reverse().map((citation, index) => (
                                    <motion.li 
                                        key={citation.id}
                                        layout
                                        custom={index}
                                        variants={citationVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className="mb-4"
                                    >
                                        <a 
                                            href={citation.link} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-blue-600 hover:underline inline-block py-0"
                                            style={{ lineHeight: '1.2' }}
                                        >
                                            {citation.title}
                                        </a>
                                        <p className="text-sm text-gray-600 mt-1">{citation.snippet.replace(/<b>|<\/b>/g, '')}</p>
                                    </motion.li>
                                ))}
                            </AnimatePresence>
                        </ul>
                    </div>
                </aside>
            </div>

            <div className="bg-gray-100 flex justify-center px-8 flex-shrink-0 py-4">
                <AudioPlayer 
                    src={manifest.slides[currentSlideIndex]?.audio || ''} 
                    onNext={goToNextSlide}
                    onPrevious={goToPreviousSlide}
                    isFirst={currentSlideIndex === 0}
                    isLast={currentSlideIndex === totalSlides - 1}
                    currentSlide={currentSlideIndex + 1}
                    totalSlides={totalSlides}
                />
            </div>
        </div>
    );
};

export default LessonSlidePage;
