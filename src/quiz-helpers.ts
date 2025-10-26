import useQuizStore from './store';
import { questions as longevityQuestions } from './pages/Onboarding/onboarding-questions';
import { questions as masteringLongevityCourseContent } from './pages/MasteringHealthspanFramework/course-content';
import type { QuestionType } from './pages/MasteringHealthspanFramework/course-content';

export const getQuestionsForQuiz = (quizId: string): any[] => {
    const quizState = useQuizStore.getState().quizzes[quizId];
    if (quizState && quizState.questions) {
      return quizState.questions;
    }
    if (quizId === 'onboarding') return longevityQuestions;
    if (quizId === 'cardiac_health') return masteringLongevityCourseContent;
    // Add other quiz mappings here
    return [];
};
  
export const doesConditionPass = (answers: Record<string, any>, question: QuestionType): boolean => {
    if (!question.condition) return true;
    const { questionId, value } = question.condition;
    const actualAnswer = answers[questionId];
    if (Array.isArray(value)) {
      return value.includes(actualAnswer);
    }
    return actualAnswer === value;
};
