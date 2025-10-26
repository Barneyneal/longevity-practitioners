import React from 'react';
import useQuizStore from '../../store';
import { questions } from './onboarding-questions';
import Question from '../../components/Question';
import TitlePage from '../../components/TitlePage';
import SectionTitlePage from "../../components/SectionTitlePage";
import PrivacyPage from "../../components/PrivacyPage";
import { useEffect } from "react";
import { Navigate } from 'react-router-dom';
import LoadingDots from '../../components/LoadingDots';
import { useRef } from 'react';

const SubmitAndRedirect: React.FC<{ quizId: string }> = ({ quizId }) => {
  const submitQuiz = useQuizStore(state => state.submitQuiz);
  const submitted = useRef(false);

  useEffect(() => {
    if (submitted.current) {
      return;
    }
    submitted.current = true;
    submitQuiz(quizId);
  }, [quizId, submitQuiz]);

  return (
    <div className="flex-grow flex items-center justify-center">
      <LoadingDots />
    </div>
  );
};

const OnboardingPage: React.FC = () => {
  const { quizzes, activeQuiz, startQuiz, user } = useQuizStore();
  const quizId = "onboarding";

  const titlePage = {
    type: 'title',
    text: "Register to access the practitioner portal",
    subtext: "By creating your account, you gain immediate access to the complete Longevity & Healthspan Curriculum Framework—the definitive, evidence-based system for practitioners serious about client results.",
  };

  // On mount, ensure the quiz is started from the very beginning.
  useEffect(() => {
    startQuiz(quizId);
  }, [startQuiz]);

  const quizState = activeQuiz === quizId ? quizzes[quizId] : undefined;
  
  // If the user is logged in, this page is not for them. Redirect to the dashboard.
  if (user?.id) {
    return <Navigate to="/dashboard" />;
  }

  // Don't render anything until the quiz state is initialized.
  if (!quizState) {
    return null; 
  }

  const { currentQuestion: index } = quizState;

  if (index === -2) {
    return <TitlePage quizId={quizId} title={titlePage.text} subtext={titlePage.subtext} />;
  }

  if (index === -1) {
    return <PrivacyPage quizId={quizId} />;
  }

  if (index < questions.length) {
    const question = questions[index];
    if (question.type === 'section-title') {
      return (
        <SectionTitlePage
            key={question.id}
            quizId={quizId}
            text={question.text}
            subtext={question.subtext}
            citation={question.citation}
        />
      );
    }
    
    // These types are handled by the special pages above.
    if (question.type === 'title' || question.type === 'privacy') {
        return null;
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
        isLastQuestion={index === questions.length - 1}
      />
    );
  } 
  
  // After the last question, show the loading/submission component.
  return <SubmitAndRedirect quizId={quizId} />;
};

export default OnboardingPage; 