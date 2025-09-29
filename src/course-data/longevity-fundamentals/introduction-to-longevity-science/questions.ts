import type { QuestionType as Question } from '../../../pages/MasteringHealthspanFramework/course-content';

export const questions: Question[] = [
  {
    "id": "intro-q1",
    "text": "What is the primary focus of longevity science?",
    "type": "multi-choice",
    "options": [
      "Extending human lifespan indefinitely.",
      "Curing all age-related diseases.",
      "Extending 'healthspan' - the period of life spent in good health.",
      "Reversing the aging process entirely."
    ]
  },
  {
    "id": "intro-q2",
    "type": "multiple-choice",
    "text": "Which of the following is considered a key discovery in longevity research?",
    "options": [
      "The role of telomeres in cellular aging.",
      "The reversal of genetic mutations.",
      "The complete cessation of aging through cryogenics.",
      "The discovery of a single 'aging gene'."
    ]
  },
  {
    "id": "quiz-complete",
    "type": "section-title",
    "text": "Thank you for completing the quiz.",
    "subtext": "Your results will be delivered via email and may take up to 5 minutes. Click below to continue with the module."
  }
];
