import useQuizStore from "../../store";
import Question from "../../components/Question";
import TitlePage from "../../components/TitlePage";
import ThankYouPage from "../../components/ThankYouPage";
import SectionTitlePage from "../../components/SectionTitlePage";
import { questions } from "./questions";
import PrivacyPage from "../../components/PrivacyPage";
import { useEffect } from "react";

const LongevityQuizPage = () => {
  const { quizzes, activeQuiz, startQuiz, nextQuestion, user } = useQuizStore();
  const quizId = "longevity";

  // Compute a safe currentQuestion before any early returns
  const safeQuiz = activeQuiz ? quizzes[activeQuiz] : undefined;
  const currentQuestion = safeQuiz?.currentQuestion ?? -999; // sentinel pre-init

  // Ensure quiz is started
  useEffect(() => {
    if (!activeQuiz) {
      startQuiz(quizId);
    }
  }, [activeQuiz, startQuiz]);

  // If logged in, skip privacy and identity steps
  useEffect(() => {
    if (!user?.id) return;
    if (currentQuestion === -1) {
      nextQuestion(quizId);
      return;
    }
    if (currentQuestion >= 0 && currentQuestion < questions.length) {
      const q = questions[currentQuestion];
      if (q && (q.type === 'privacy' || q.type === 'name' || q.type === 'email' || q.type === 'password')) {
        nextQuestion(quizId);
      }
    }
  }, [user?.id, currentQuestion, nextQuestion]);

  // Now allow early returns after hooks are declared
  if (!activeQuiz || !safeQuiz) {
    return null; // or a loading spinner
  }

  if (safeQuiz.currentQuestion === -2) {
    return <TitlePage quizId={quizId} />;
  }

  if (safeQuiz.currentQuestion === -1) {
    return <PrivacyPage quizId={quizId} />;
  }

  if (safeQuiz.currentQuestion < questions.length) {
    const question = questions[safeQuiz.currentQuestion];
    if (question.type === 'section-title') {
      const isWrapUp = question.id === 'wrap-title';
      return (
        <SectionTitlePage
            key={question.id}
            quizId={quizId}
            text={question.text}
            subtext={question.subtext}
            citation={question.citation}
            submitOnContinue={Boolean(user?.id) && isWrapUp}
        />
      );
    }
    
    if (question.type === 'title' || question.type === 'privacy') {
        // These types are handled by the TitlePage and PrivacyPage components
        // and should not be passed to the Question component.
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
        isLastQuestion={safeQuiz.currentQuestion === questions.length - 1}
      />
    );
  } else {
    return <ThankYouPage quizId={quizId} />;
  }
};

export default LongevityQuizPage; 