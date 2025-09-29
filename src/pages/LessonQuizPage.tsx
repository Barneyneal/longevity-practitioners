import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useQuizStore from '../store';
import { type QuestionType } from './MasteringHealthspanFramework/course-content';
import Question from '../components/Question';
import SectionTitlePage from "../components/SectionTitlePage";
import PrivacyPage from "../components/PrivacyPage";
import LoadingDots from '../components/LoadingDots';

const questionImports = import.meta.glob<string>('/src/course-data/**/*.ts');

const LessonQuizPage: React.FC = () => {
    const { moduleSlug, lessonSlug } = useParams<{ moduleSlug: string; lessonSlug: string }>();
    const navigate = useNavigate();

    const { quizzes, activeQuiz, startQuiz, nextQuestion } = useQuizStore();
    const [questions, setQuestions] = useState<QuestionType[] | null>(null);

    const quizId = `${moduleSlug}-${lessonSlug}-quiz`;

    useEffect(() => {
        const loadQuestions = async () => {
            if (moduleSlug && lessonSlug) {
                try {
                    const questionsPath = `/src/course-data/${moduleSlug}/${lessonSlug}/questions.ts`;
                    if (!questionImports[questionsPath]) {
                        throw new Error(`Questions file not found at ${questionsPath}`);
                    }
                    const questionsModule = await questionImports[questionsPath]();
                    // @ts-ignore
                    const loadedQuestions = questionsModule.questions as QuestionType[];
                    setQuestions(loadedQuestions);
                    startQuiz(quizId, loadedQuestions);

                } catch (error) {
                    console.error("Failed to load quiz data:", error);
                    navigate(`/mastering-longevity`); // Redirect if quiz not found
                }
            }
        };
        loadQuestions();
    }, [moduleSlug, lessonSlug, quizId, startQuiz, navigate]);

    const safeQuiz = activeQuiz === quizId ? quizzes[activeQuiz] : undefined;

    if (!questions || !safeQuiz) {
        return <div className="flex justify-center items-center h-screen"><LoadingDots /></div>;
    }

    if (safeQuiz.currentQuestion < questions.length) {
        const question = questions[safeQuiz.currentQuestion];

        if (question.type === 'section-title' || question.type === 'title') {
            return (
                <SectionTitlePage
                    key={question.id}
                    quizId={quizId}
                    text={question.text}
                    subtext={question.subtext}
                    citation={question.citation}
                    submitOnContinue={safeQuiz.currentQuestion === questions.length - 1}
                />
            );
        }

        if (question.type === 'privacy') {
            return <PrivacyPage quizId={quizId} />;
        }

        const questionType = question.type === 'multiple-choice' ? 'multi-choice' : question.type;

        return (
            <Question
                key={question.id}
                quizId={quizId}
                questionId={question.id}
                questionText={question.text}
                questionType={questionType}
                options={question.options}
                min={question.min}
                max={question.max}
                subtext={question.subtext}
                sliderLabels={question.sliderLabels}
                isLastQuestion={safeQuiz.currentQuestion === questions.length - 1}
                isLessonQuiz={true}
            />
        );
    } else {
        // Quiz is finished, navigate back to the curriculum page.
        // The navigation will be handled by the submitQuiz function.
        // For now, we can just show a loading state or redirect.
        useEffect(() => {
            navigate(`/mastering-longevity`);
        }, [navigate]);
        return <div className="flex justify-center items-center h-screen"><LoadingDots /></div>;
    }
};

export default LessonQuizPage;
