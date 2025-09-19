import useQuizStore from "../../store";
import Question from "../../components/Question";
import TitlePage from "../../components/TitlePage";
import ThankYouPage from "../../components/ThankYouPage";
import SectionTitlePage from "../../components/SectionTitlePage";
import { questions } from "./questions";
import { useEffect } from "react";

const CardiacHealthQuizPage = () => {
  const { quizzes, activeQuiz, startQuiz, nextQuestion } = useQuizStore();
  const quizId = "cardiac_health";

  useEffect(() => {
    if (!activeQuiz || activeQuiz !== quizId) {
      startQuiz(quizId);
    }
  }, [activeQuiz, startQuiz, quizId]);

  // This effect will skip the privacy page step if it's ever reached.
  useEffect(() => {
    if (quizzes[quizId]?.currentQuestion === -1) {
      nextQuestion(quizId);
    }
  }, [quizzes, quizId, nextQuestion]);


  if (!activeQuiz || !quizzes[activeQuiz]) {
    return null; // or a loading spinner
  }

  const { currentQuestion, answers } = quizzes[activeQuiz];

  if (currentQuestion === -2) {
    return <TitlePage quizId={quizId} title="The Ultimate Cardiac Health Quiz" />;
  }

  // Find the index of the next question to display, skipping conditional ones.
  let questionIndex = currentQuestion;
  if (questionIndex >= 0) {
    while (questionIndex < questions.length) {
      const question = questions[questionIndex];
      if (question.condition) {
        const { questionId, value } = question.condition;
        const previousAnswer = answers[questionId];
        const conditionMet = Array.isArray(value) ? value.includes(previousAnswer as any) : previousAnswer === value;
        if (!conditionMet) {
          questionIndex++;
          continue;
        }
      }
      break; // Found a valid question to render
    }
  }


  if (questionIndex >= 0 && questionIndex < questions.length) {
    const question = questions[questionIndex];

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
    
    // Prevent invalid types from being passed to the Question component
    if (question.type === 'title' || question.type === 'privacy') {
        return null;
    }
    
    // Determine if the current question is the last one to be displayed
    const hasNextVisible = (() => {
      for (let i = questionIndex + 1; i < questions.length; i++) {
        const q = questions[i];
        if (!q.condition) return true; // visible unconditionally
        const { questionId, value } = q.condition;
        const prev = answers[questionId];
        const passes = Array.isArray(value) ? (value as any[]).includes(prev as any) : prev === value;
        if (passes) return true; // a subsequent visible conditional question exists
      }
      return false;
    })();
    const isLastVisibleQuestion = !hasNextVisible;

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
        isLastQuestion={isLastVisibleQuestion}
      />
    );
  } else {
    return <ThankYouPage quizId={quizId} />;
  }
};

export default CardiacHealthQuizPage; 