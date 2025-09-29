import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

import LessonHeader from '../components/LessonHeader';
import AudioPlayer from '../components/AudioPlayer';

const manifestImports = import.meta.glob<{ default: any }>('/src/course-data/**/*.json');
const slidesImports = import.meta.glob<string>('/src/course-data/**/*.md', { query: '?raw', import: 'default' });


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

const markdownComponents = {
    h2: (props: any) => <h2 className="text-4xl font-bold mb-8 text-left" {...props} />,
    li: ({ node, ordered, ...props }: any) => {
        const isNewSection = node?.children?.[0]?.children?.[0]?.tagName === 'strong';
        return <li className={isNewSection ? 'mt-4' : ''} {...props} />;
    },
    strong: ({...props}) => <strong className="font-bold" {...props} />,
};

interface Manifest {
    lessonTitle: string;
    slides: { slideNumber: number; citationIds: string[]; audio: string; }[];
}

const LessonSlidePage: React.FC = () => {
    const { moduleSlug, lessonSlug } = useParams<{ moduleSlug: string; lessonSlug: string }>();
    const navigate = useNavigate();

    const [manifest, setManifest] = useState<Manifest | null>(null);
    const [slidesContent, setSlidesContent] = useState<string[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [cumulativeCitations, setCumulativeCitations] = useState<any[]>([]);
    const [allCitations, setAllCitations] = useState<any[]>([]);

    useEffect(() => {
        const loadCourseData = async () => {
            if (moduleSlug && lessonSlug) {
                try {
                    const manifestPath = `/src/course-data/${moduleSlug}/${lessonSlug}/index.json`;
                    const slidesPath = `/src/course-data/${moduleSlug}/${lessonSlug}/slides.md`;
                    const citationsPath = `/src/course-data/${moduleSlug}/${lessonSlug}/citations.json`;

                    console.log('Attempting to load manifest from:', manifestPath);
                    if (!manifestImports[manifestPath]) {
                        throw new Error(`Manifest file not found at ${manifestPath}`);
                    }
                    const manifestModule = await manifestImports[manifestPath]();
                    setManifest(manifestModule.default as Manifest);
                    
                    console.log('Attempting to load slides from:', slidesPath);
                    if (!slidesImports[slidesPath]) {
                        throw new Error(`Slides file not found at ${slidesPath}`);
                    }
                    const rawSlides = await slidesImports[slidesPath]();
                    setSlidesContent(rawSlides.split(/\n(?=## )/));

                    console.log('Attempting to load citations from:', citationsPath);
                    if (!manifestImports[citationsPath]) {
                        throw new Error(`Citations file not found at ${citationsPath}`);
                    }
                    const citationsModule = await manifestImports[citationsPath]();
                    setAllCitations(citationsModule.default);

                } catch (error) {
                    console.error("Failed to load course data:", error);
                    navigate('/dashboard'); // Or a 404 page
                }
            }
        };

        loadCourseData();
    }, [moduleSlug, lessonSlug, navigate]);
    
    useEffect(() => {
        const loadCitations = async () => {
            if (manifest) {
                const citationIdsToShow = new Set<string>();
                for (let i = 0; i <= currentSlide; i++) {
                    const slideManifest = manifest.slides.find(s => s.slideNumber === i + 1);
                    if (slideManifest) {
                        slideManifest.citationIds.forEach(id => citationIdsToShow.add(id));
                    }
                }
                setCumulativeCitations(allCitations.filter(citation => citationIdsToShow.has(citation.id)));
            }
        };
        loadCitations();
    }, [manifest, currentSlide, allCitations]);
 
    const slides = useMemo(() => slidesContent, [slidesContent]);
    const lessonTitle = useMemo(() => manifest?.lessonTitle || '', [manifest]);

    const goToNextSlide = () => {
        setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1));
    };

    const goToPreviousSlide = () => {
        setCurrentSlide(prev => Math.max(prev - 1, 0));
    };

    if (!manifest || slidesContent.length === 0 || allCitations.length === 0) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="bg-gray-100 h-screen overflow-hidden flex flex-col">
            <LessonHeader 
                lessonTitle={lessonTitle} 
                onBack={() => navigate(`/mastering-longevity`)} 
            />
            
            <div className="flex gap-4 pt-4 px-4 flex-1 min-h-0">
                {/* Main Content Panel (Lightbox) */}
                <main className="flex-1 flex flex-col overflow-hidden relative bg-white rounded-2xl shadow-sm">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="prose max-w-none w-full h-full flex flex-col items-start justify-center p-12"
                        >
                            <ReactMarkdown components={markdownComponents}>{slides[currentSlide]}</ReactMarkdown>
                        </motion.div>
                    </AnimatePresence>
                </main>

                {/* Citations Panel */}
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

            {/* Bottom Navigation */}
            <div className="bg-gray-100 flex justify-center px-8 flex-shrink-0 py-4">
                <AudioPlayer 
                    src={manifest.slides[currentSlide]?.audio || ''} 
                    onNext={goToNextSlide}
                    onPrevious={goToPreviousSlide}
                    isFirst={currentSlide === 0}
                    isLast={currentSlide === slides.length - 1}
                    currentSlide={currentSlide + 1}
                    totalSlides={slides.length}
                />
            </div>
        </div>
    );
};

export default LessonSlidePage;
