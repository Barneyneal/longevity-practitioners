import { type QuestionType } from './pages/LongevityQuiz/questions';
import { create } from 'zustand';
import { questions as longevityQuestions } from './pages/LongevityQuiz/questions';
import { questions as cardiacQuestions } from './pages/CardiacHealthQuiz/questions';
import { jwtDecode } from 'jwt-decode';

// Single-flight and throttle helpers (module scoped)
let userFetchInFlight: Promise<void> | null = null;
let subsFetchInFlight: Promise<void> | null = null;
let userFetchedAt = 0;
let subsFetchedAt = 0;
const THROTTLE_MS = 5000;

interface User {
  id: string | null;
  email: string | null;
  firstName?: string;
  lastName?: string;
}

interface DecodedToken {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

interface QuizState {
  activeQuiz: string | null;
  quizzes: {
    [quizId: string]: {
      currentQuestion: number;
      answers: Record<string, any>;
    };
  };
  progress: number; // Add progress to the state
  user: User | null;
  completedQuizzes: Record<string, { completedAt: string; score?: number }>;
  authToken: string | null;
  submissions: any[]; // Add submissions array to the store
  isFetchingSubmissions: boolean;
  isFetchingUser?: boolean;
  nextQuestion: (quizId: string) => void;
  previousQuestion: (quizId: string) => void;
  setAnswer: (quizId: string, questionId: string, value: any) => void;
  submitAnswer: (quizId: string, questionId: string, value: any) => Promise<void>;
  submitQuiz: (quizId: string) => Promise<void>;
  resetQuiz: (quizId: string) => void;
  startQuiz: (quizId: string) => void;
  setUser: (user: User) => void;
  login: (token: string) => void;
  logout: () => void;
  setQuizCompleted: (quizId: string, meta: { completedAt: string; score?: number }) => void;
  fetchSubmissions: () => Promise<void>; // Add fetchSubmissions action
  fetchUser: () => Promise<void>;
  updateProgress: (progress: number) => void;
  updateProgressBasedOnAnswers: (quizId: string, answers: Record<string, any>) => void; // Add updateProgressBasedOnAnswers action
}

const getQuestionsForQuiz = (quizId: string): QuestionType[] => {
  if (quizId === 'cardiac_health') return cardiacQuestions as unknown as QuestionType[];
  return longevityQuestions as unknown as QuestionType[];
};

const doesConditionPass = (answers: Record<string, any>, question: QuestionType): boolean => {
  if (!question.condition) return true;
  const { questionId, value } = question.condition;
  const given = answers[questionId];
  return Array.isArray(value) ? value.includes(given) : given === value;
};

const getPersisted = <T,>(key: string, fallback: T): T => {
  try {
    if (typeof window === 'undefined') return fallback;
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const persist = (key: string, value: unknown) => {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
};

const useQuizStore = create<QuizState>()((set, get) => ({
  activeQuiz: null,
  quizzes: {},
  progress: 0,
  user: getPersisted('ld_user', { id: null, email: null, firstName: '', lastName: '' }),
  completedQuizzes: getPersisted('ld_completed', {} as Record<string, { completedAt: string; score?: number }>),
  authToken: getPersisted('ld_auth_token', null),
  submissions: [],
  isFetchingSubmissions: false,
  isFetchingUser: false,

  startQuiz: (quizId: string) =>
    set((state) => ({
      activeQuiz: quizId,
      quizzes: {
        ...state.quizzes,
        [quizId]: {
          currentQuestion: -2,
          answers: {}, // Explicitly reset answers
        },
      },
    })),
  nextQuestion: (quizId: string) => {
    const { quizzes } = get();
    const quizQuestions = getQuestionsForQuiz(quizId);
    const { currentQuestion, answers } = quizzes[quizId];
    if (currentQuestion < 0) {
      set((state) => ({
        quizzes: {
          ...state.quizzes,
          [quizId]: { ...state.quizzes[quizId], currentQuestion: currentQuestion + 1 },
        },
      }));
      get().updateProgress(0); // Reset progress for title/privacy pages
      return;
    }
    let nextIndex = currentQuestion + 1;
    while (nextIndex < quizQuestions.length) {
      const nextQ = quizQuestions[nextIndex];
      if (doesConditionPass(answers, nextQ)) {
        break;
      }
      nextIndex++;
    }
    set((state) => ({
      quizzes: {
        ...state.quizzes,
        [quizId]: { ...state.quizzes[quizId], currentQuestion: nextIndex },
      },
    }));
    get().updateProgressBasedOnAnswers(quizId, answers);
  },
  previousQuestion: (quizId: string) => {
    const { quizzes } = get();
    const quizQuestions = getQuestionsForQuiz(quizId);
    const { currentQuestion, answers } = quizzes[quizId];
    // For cardiac quiz, going back from the first question should return to Title (-2)
    if (quizId === 'cardiac_health' && currentQuestion <= 0) {
      set((state) => ({
        quizzes: {
          ...state.quizzes,
          [quizId]: { ...state.quizzes[quizId], currentQuestion: -2 },
        },
      }));
      get().updateProgressBasedOnAnswers(quizId, answers);
      return;
    }
    if (currentQuestion <= 0) {
      set((state) => ({
        quizzes: {
          ...state.quizzes,
          [quizId]: { ...state.quizzes[quizId], currentQuestion: currentQuestion - 1 },
        },
      }));
      get().updateProgressBasedOnAnswers(quizId, answers);
      return;
    }
    let prevIndex = currentQuestion - 1;
    while (prevIndex >= 0) {
      const prevQ = quizQuestions[prevIndex];
      if (doesConditionPass(answers, prevQ)) {
        break;
      }
      prevIndex--;
    }
    set((state) => ({
      quizzes: {
        ...state.quizzes,
        [quizId]: { ...state.quizzes[quizId], currentQuestion: prevIndex },
      },
    }));
    get().updateProgressBasedOnAnswers(quizId, answers);
  },
  setAnswer: (quizId: string, questionId: string, value: any) =>
    set((state) => ({
      quizzes: {
        ...state.quizzes,
        [quizId]: {
          ...state.quizzes[quizId],
          answers: { ...state.quizzes[quizId].answers, [questionId]: value },
        },
      },
    })),
  submitAnswer: async (quizId: string, questionId: string, value: any) => {
    const { quizzes } = get();
    const quizQuestions = getQuestionsForQuiz(quizId);
    const { answers, currentQuestion } = quizzes[quizId];
    const newAnswers = { ...answers, [questionId]: value };

    let nextIndex = currentQuestion + 1;
    while (nextIndex < quizQuestions.length) {
      const nextQ = quizQuestions[nextIndex];
      if (doesConditionPass(newAnswers, nextQ)) {
        break;
      }
      nextIndex++;
    }

    set((state) => ({
      quizzes: {
        ...state.quizzes,
        [quizId]: { ...state.quizzes[quizId], answers: newAnswers, currentQuestion: nextIndex },
      },
    }));
    get().updateProgressBasedOnAnswers(quizId, newAnswers);

    if (nextIndex >= quizQuestions.length) {
      await get().submitQuiz(quizId);
    }
  },
  submitQuiz: async (quizId: string) => {
    const { quizzes, user } = get();
    const quizQuestions = getQuestionsForQuiz(quizId);
    const { answers } = quizzes[quizId];
    const apiBase = import.meta.env.PROD
      ? ((import.meta as any).env?.VITE_API_BASE || '')
      : '';

    // Determine the correct webhook URL based on the quiz
    const extractHttpUrl = (raw?: string | undefined | null): string => {
      if (!raw) return '';
      const str = String(raw);
      // Accept values like "https://..." or even mistakenly pasted as
      // VITE_N8N_CARDIAC_WEBHOOK_URL="https://..."
      const m = str.match(/https?:\/\/[^\s"']+/i);
      return m ? m[0] : '';
    };

    let submissionUrl = '';
    if (import.meta.env.PROD) {
      const raw = quizId === 'cardiac_health'
        ? (import.meta.env.VITE_N8N_CARDIAC_WEBHOOK_URL as string)
        : ((import.meta.env.VITE_N8N_LONGEVITY_WEBHOOK_URL as string) || (import.meta.env.VITE_N8N_WEBHOOK_URL as string));
      submissionUrl = extractHttpUrl(raw);
    } else {
      // In development, proxy to the appropriate n8n origin
      submissionUrl = quizId === 'cardiac_health' ? '/proxy/cardiac' : '/proxy/long';
    }

    // Resolve user based on current answers; override any stale local userId
    let effectiveUserId: string | null = user?.id ?? null;
    if (quizId === 'longevity') {
      const nameAnswer = (answers['name'] as any) || {};
      const emailAnswer = (answers['email'] as any) || '';
      const passwordAnswer = (answers['password'] as any) || '';

      if (emailAnswer && passwordAnswer) {
        const registerRes = await fetch(`${apiBase}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: nameAnswer.firstName || '',
            lastName: nameAnswer.lastName || '',
            email: emailAnswer,
            password: passwordAnswer,
          }),
        });

        if (registerRes.ok) {
          const { userId, token } = await registerRes.json();
          effectiveUserId = userId;
          get().login(token);
        } else {
          // Handle registration failure
          const errorData = await registerRes.json();
          alert(`Registration failed: ${errorData.message}`);
          return;
        }
      }
    } else {
      // For non-longevity quizzes, require an authenticated user from prior registration/login
      const { authToken } = get();
      if (!authToken || !effectiveUserId) {
        alert('Please log in first to submit this quiz.');
        return;
      }
    }

    const createdAt = new Date().toISOString();
    const submission = {
      userId: effectiveUserId,
      quizId,
      sessionId: crypto.randomUUID(),
      answers: Object.entries(answers)
        .filter(([questionId]) => questionId !== 'name' && questionId !== 'email')
        .map(([questionId, value]) => {
        const question = quizQuestions.find((q) => q.id === questionId);
        return {
          questionId,
          questionText: question ? question.text : '',
          value,
        };
      }),
      createdAt,
    };

    // Always create the initial submission doc first, so data is saved even if n8n errors
    let createdSubmissionId: string | null = null;
    try {
      const mongoResp = await fetch(`${apiBase}/api/submissions/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: effectiveUserId,
          quizId,
          submittedAnswers: submission.answers,
          // Fallback contact to allow server to upsert user if userId missing
          contact: {
            email: (answers['email'] as any) || user?.email || '',
            firstName: ((answers['name'] as any)?.firstName) || user?.firstName || '',
            lastName: ((answers['name'] as any)?.lastName) || user?.lastName || '',
          },
        }),
      });
      if (mongoResp.ok) {
        const mongoResult = await mongoResp.json();
        createdSubmissionId = mongoResult?.submissionId || mongoResult?._id || null;
      } else if (mongoResp.status === 422) {
        const errorData = await mongoResp.json();
        const answered = errorData?.validation?.answered_count || 0;
        const total = errorData?.validation?.total_questions || 0;
        alert(`Warning: Your submission could not be processed because not enough questions were answered. You answered ${answered} out of ${total} questions.`);
      }
    } catch (e) {
      console.error('Failed to create submission in Mongo:', e);
    }

    // Then optionally post to n8n in the background with a minimal payload (ignore errors)
    if (createdSubmissionId) {
      const minimalPayload = {
        userId: effectiveUserId,
        submissionId: createdSubmissionId,
        quizId,
      };
      fetch(submissionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(minimalPayload),
      }).catch(() => {});
    }

    // Mark completion locally regardless
    const completedAt = new Date().toISOString();
    get().setQuizCompleted(quizId, { completedAt });
    get().updateProgress(100); // Set progress to 100 on completion
  },
  resetQuiz: (quizId: string) =>
    set((state) => ({
      quizzes: {
        ...state.quizzes,
        [quizId]: {
          ...state.quizzes[quizId],
          currentQuestion: -2,
          answers: {},
        },
      },
      progress: 0, // Also reset progress
    })),
  setUser: (user: User) => set((state) => {
    const next = { ...state, user } as QuizState;
    persist('ld_user', user);
    return next;
  }),
  login: (token: string) => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const user: User = {
        id: decoded.userId,
        email: decoded.email,
        firstName: '', // You might want to fetch this from an API after login
        lastName: '',
      };
      set({ authToken: token, user });
      persist('ld_auth_token', token);
      persist('ld_user', user);
      get().fetchUser(); // Fetch full user details after setting token
    } catch (error) {
      console.error('Failed to decode token:', error);
    }
  },
  logout: () => {
    set({
      authToken: null,
      user: { id: null, email: null, firstName: '', lastName: '' },
      submissions: [], // Clear submissions on logout
      isFetchingSubmissions: false,
      isFetchingUser: false,
      progress: 0, // Also reset progress on logout
    });
    persist('ld_auth_token', null);
    persist('ld_user', null);
  },
  setQuizCompleted: (quizId: string, meta: { completedAt: string; score?: number }) => set((state) => {
    const nextCompleted = { ...state.completedQuizzes, [quizId]: meta };
    persist('ld_completed', nextCompleted);
    return { ...state, completedQuizzes: nextCompleted } as QuizState;
  }),
  fetchSubmissions: async () => {
    const { authToken } = get();
    if (!authToken) return;
    const now = Date.now();
    if (subsFetchInFlight) return subsFetchInFlight;
    if (now - subsFetchedAt < THROTTLE_MS) return;
    set({ isFetchingSubmissions: true });
    subsFetchInFlight = (async () => {
      try {
        const response = await fetch('/api/submissions/me', {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch submissions');
        }
        const data = await response.json();
        set({ submissions: data });
        subsFetchedAt = Date.now();
      } catch (error) {
        console.error(error);
      } finally {
        set({ isFetchingSubmissions: false });
        subsFetchInFlight = null;
      }
    })();
    return subsFetchInFlight;
  },
  fetchUser: async () => {
    const { authToken } = get();
    if (!authToken) return;
    const now = Date.now();
    if (userFetchInFlight) return userFetchInFlight;
    if (now - userFetchedAt < THROTTLE_MS) return;
    set({ isFetchingUser: true });
    userFetchInFlight = (async () => {
      try {
        const response = await fetch('/api/users/me', {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }
        const userData = await response.json();
        set((state) => ({ user: { ...state.user, ...userData } as User }));
        userFetchedAt = Date.now();
      } catch (error) {
        console.error(error);
      } finally {
        set({ isFetchingUser: false });
        userFetchInFlight = null;
      }
    })();
    return userFetchInFlight;
  },
  updateProgress: (progress: number) => set({ progress }),
  // Helper function to calculate progress based on visible questions
  updateProgressBasedOnAnswers: (quizId: string, answers: Record<string, any>) => {
    const quizQuestions = getQuestionsForQuiz(quizId);
    const current = get().quizzes[quizId]?.currentQuestion ?? -2;

    // Title/Privacy steps
    if (current < 0) {
      set({ progress: 0 });
      return;
    }

    // Build list of visible, answerable question indices
    const visibleIndices = quizQuestions
      .map((q, idx) => ({ q, idx }))
      .filter(({ q }) => doesConditionPass(answers, q) && q.type !== 'title' && q.type !== 'privacy')
      .map(({ idx }) => idx);

    const total = visibleIndices.length;
    if (total === 0) {
      set({ progress: 0 });
      return;
    }

    // Position is count of visible items up to and including current index
    const position = visibleIndices.filter((idx) => idx <= current).length;
    const percentage = Math.max(0, Math.min(100, (position / total) * 100));

    set({ progress: percentage });
  },
}));

// Auto-login if token exists
const initialAuthToken = getPersisted('ld_auth_token', null);
if (initialAuthToken) {
  useQuizStore.getState().login(initialAuthToken);
}

export default useQuizStore; 