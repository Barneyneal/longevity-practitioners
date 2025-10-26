import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile, type User as FirebaseUser } from 'firebase/auth';
import { auth } from './firebase';
import { getQuestionsForQuiz, doesConditionPass } from './quiz-helpers';
import { courseManifest, getTotalSlideCount } from './course-manifest';
import Cookies from 'js-cookie';

interface User {
  id: string | null;
  email: string | null;
  firstName: string;
  lastName: string;
}

interface Submission {
  _id: string;
  userId: string;
  quizId: string;
  submittedAnswers: Array<{ questionId: string; answer: any; questionText: string }>;
  submittedAt: string;
}

interface QuizState {
  user: User;
  firebaseUser: FirebaseUser | null;
  authToken: string | null;
  quizzes: Record<string, {
    currentQuestion: number;
    answers: Record<string, any>;
    questions?: any[]; // Allow for dynamic questions
  }>;
  activeQuiz: string | null;
  submissions: Submission[];
  isFetchingUser: boolean;
  isFetchingSubmissions: boolean;
  progressData: {
    lastKnownLocation: { moduleSlug: string; lessonSlug: string; slideNumber: number } | null;
    globalProgressPercentage: number;
  };
  promptShown: boolean;
  progress: number; // Global progress percentage for the current quiz
  completedQuizzes: Record<string, { completedAt: string; score?: number }>;

  // Actions
  startQuiz: (quizId: string, questions?: any[], startIndex?: number) => void;
  nextQuestion: (quizId: string) => void;
  prevQuestion: (quizId: string) => void;
  submitAnswer: (quizId: string, questionId: string, answer: any) => void;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetQuiz: (quizId: string) => void;
  setUser: (user: User) => void;
  submitQuiz: (quizId: string) => Promise<void>;
  createUserInDb: (user: FirebaseUser, firstName?: string, lastName?: string) => Promise<User | null>;
  clearAuth: () => void;
  setQuizCompleted: (quizId: string, meta: { completedAt: string; score?: number }) => void;
  fetchSubmissions: () => Promise<void>;
  fetchUser: () => Promise<void>;
  fetchUserProgress: () => Promise<void>;
  saveUserProgress: () => Promise<void>;
  updateUserProgress: (data: Partial<QuizState['progressData']>) => void;
  setPromptShown: (shown: boolean) => void;
  updateProgress: (progress: number) => void;
  updateProgressBasedOnAnswers: (quizId: string, answers: Record<string, any>) => void;
}

const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      user: { id: null, email: null, firstName: '', lastName: '' },
      firebaseUser: null,
      authToken: null,
      quizzes: {},
      activeQuiz: null,
      submissions: [],
      isFetchingUser: true, // Start with true to avoid flashes of login page
      isFetchingSubmissions: false,
      progressData: { lastKnownLocation: null, globalProgressPercentage: 0 },
      promptShown: false,
      progress: 0,
      completedQuizzes: {},

      startQuiz: (quizId: string, questions?: any[], startIndex: number = -2) => {
        set((state) => ({
          activeQuiz: quizId,
          quizzes: {
            ...state.quizzes,
            [quizId]: {
              currentQuestion: startIndex, // Start at the title page
              answers: {},
              questions,
            },
          },
          progress: 0,
        }));
      },

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
      prevQuestion: (quizId: string) => {
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
      submitAnswer: (quizId: string, questionId: string, answer: any) => {
        set((state) => {
          const quizState = state.quizzes[quizId];
          if (!quizState) return state;

          const newAnswers = {
            ...quizState.answers,
            [questionId]: answer,
          };

          const newQuizState = {
            ...quizState,
            answers: newAnswers,
          };

          get().updateProgressBasedOnAnswers(quizId, newAnswers);

          return {
            quizzes: {
              ...state.quizzes,
              [quizId]: newQuizState,
            },
          };
        });
        get().nextQuestion(quizId);
      },
      submitQuiz: async (quizId: string) => {
        const { quizzes, activeQuiz, setQuizCompleted, fetchUser, createUserInDb } = get();
        const quizState = quizzes[activeQuiz!];
        const { answers } = quizState;

        // Onboarding has a special registration flow
        if (quizId === 'onboarding') {
          const nameAnswer = (answers['name'] as any) || '';
          const emailAnswer = (answers['email'] as any) || '';
          const passwordAnswer = (answers['password'] as any) || '';

          let firstName = '';
          let lastName = '';

          // Robustly handle name whether it's an object or a string
          if (typeof nameAnswer === 'object' && nameAnswer !== null) {
            firstName = nameAnswer.firstName || '';
            lastName = nameAnswer.lastName || '';
          } else if (typeof nameAnswer === 'string') {
            const nameParts = nameAnswer.trim().split(' ');
            firstName = nameParts[0] || '';
            lastName = nameParts.slice(1).join(' ') || '';
          }

          if (!emailAnswer || !passwordAnswer || !firstName) {
            console.error("Email, password, and name are required for onboarding.");
            // It might be good to show an alert to the user here as well.
            alert("Registration failed: Please ensure you have provided your full name, email, and password.");
            return; // Exit if essential info is missing
          }
          try {
            const userCredential = await createUserWithEmailAndPassword(auth, emailAnswer, passwordAnswer);
            const newUser = userCredential.user;

            // Update Firebase profile with display name
            await updateProfile(newUser, {
              displayName: `${firstName} ${lastName}`.trim(),
            });

            // Explicitly create user in our DB with first and last name
            await createUserInDb(newUser, firstName, lastName);

            // The onAuthStateChanged listener will handle fetching the user and redirection.
            // No need to call fetchUser() here as the listener will do it.

          } catch (err: any) {
            // Handle specific Firebase errors
            if (err.code === 'auth/email-already-in-use') {
              if (window.confirm('A user with this email already exists. Would you like to log in instead?')) {
                window.location.href = '/login';
              }
            } else {
              alert(`Registration failed: ${err.message || 'An unknown error occurred.'}`);
            }
            // If registration fails, we should probably stop the quiz flow.
            get().resetQuiz(quizId);
          }
          return; // Stop execution for onboarding quiz
        }

        // This part handles submissions for all other quizzes
        const effectiveUserId = get().user.id;

        // Handle lesson quiz submission
        if (quizId.endsWith('-quiz')) {
          if (!effectiveUserId) {
            alert('You must be logged in to submit the quiz.');
            window.location.href = '/login';
            return;
          }

          const quizQuestions = getQuestionsForQuiz(quizId);
          const submissionData = {
            quizId,
            userId: effectiveUserId,
            submittedAnswers: Object.entries(answers).map(([questionId, value]) => {
              const question = quizQuestions.find((q: any) => q.id === questionId);
              return {
                questionId,
                answer: value,
                questionText: question?.text || 'Unknown question',
              };
            }),
            submittedAt: new Date().toISOString(),
          };

          try {
            const response = await fetch('/api/submissions/create', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${get().authToken}`,
              },
              body: JSON.stringify(submissionData),
            });
            if (!response.ok) {
              if (response.status === 401 || response.status === 403) {
                  alert('Your session has expired. Please log in to submit your quiz.');
                  await get().logout();
              } else {
                  alert('There was an error submitting your quiz. Please try again.');
              }
              throw new Error(`Failed to submit quiz with status: ${response.status}`);
            }
            setQuizCompleted(quizId, { completedAt: submissionData.submittedAt });
          } catch (error) {
            console.error('Submission error:', error);
            // Re-throw the error to be caught by the component
            throw error;
          }
          return;
        }
      },
      resetQuiz: (quizId: string) => {
        set((state) => {
          const newQuizzesState = { ...state.quizzes };
          if (newQuizzesState[quizId]) {
            // Reset the specific quiz state, including clearing all answers
            newQuizzesState[quizId] = {
              ...newQuizzesState[quizId],
              currentQuestion: -2, // Reset to the title page
              answers: {}, // Clear all previous answers
            };
          }
          return { quizzes: newQuizzesState, activeQuiz: quizId };
        });
      },
      setUser: (user: User) => set((state) => {
        const next = { ...state, user } as QuizState;
        return next;
      }),
      login: async (email, password) => {
        if (!password) {
          throw new Error("Password is required for email/password login.");
        }
        await signInWithEmailAndPassword(auth, email, password);
        // The onAuthStateChanged listener will handle the rest.
      },
      logout: async () => {
        await get().saveUserProgress(); // Save progress on logout
        await signOut(auth);
        // The onAuthStateChanged listener will now handle state clearing via clearAuth.
      },
      clearAuth: () => {
        set({
          authToken: null,
          user: { id: null, email: null, firstName: '', lastName: '' },
          firebaseUser: null,
          submissions: [],
          isFetchingSubmissions: false,
          isFetchingUser: false,
        });
        Cookies.remove('ld_auth_token');
      },
      createUserInDb: async (user: FirebaseUser, firstName?: string, lastName?: string) => {
        try {
          const token = await user.getIdToken();
          const response = await fetch('/api/users/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              uid: user.uid,
              email: user.email,
              // Pass names directly if available, otherwise fallback to displayName
              firstName: firstName,
              lastName: lastName,
              displayName: user.displayName,
            }),
          });
          if (!response.ok) {
            throw new Error('Failed to create user in database');
          }
          const dbUser = await response.json();
          if (dbUser && dbUser._id) {
              const { _id, ...rest } = dbUser;
              const formattedUser = { id: _id, ...rest };
              get().setUser(formattedUser); // Use the action to set user
              return formattedUser;
          }
          // Fallback in case the response is not as expected
          get().setUser(dbUser);
          return dbUser;
        } catch (error) {
          console.error('Error creating user in DB:', error);
          return null;
        }
      },
      setQuizCompleted: (quizId: string, meta: { completedAt: string; score?: number }) => set((state) => {
        const nextCompleted = { ...state.completedQuizzes, [quizId]: meta };
        return { ...state, completedQuizzes: nextCompleted } as QuizState;
      }),
      fetchSubmissions: async () => {
        const { authToken } = get();
        if (!authToken) return;
        set({ isFetchingSubmissions: true });
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
        } catch (error) {
          console.error(error);
        } finally {
          set({ isFetchingSubmissions: false });
        }
      },
      fetchUser: async () => {
        if (get().authToken) {
          set({ isFetchingUser: true });
          try {
            const response = await fetch('/api/users/me', {
              headers: {
                'Authorization': `Bearer ${get().authToken}`,
              },
            });
            if (!response.ok) {
              throw new Error('Failed to fetch user');
            }
            const userData = await response.json();
            if (userData && userData._id) {
                const { _id, ...rest } = userData;
                const formattedUser = { id: _id, ...rest };
                set((state) => ({ user: { ...state.user, ...formattedUser } as User }));
            }
          } catch (error) {
            console.error(error);
            // If fetching the user fails, it might mean the DB user doesn't exist yet
          } finally {
            set({ isFetchingUser: false });
          }
        }
      },
      fetchUserProgress: async () => {
        const { authToken } = get();
        if (!authToken) return;
        try {
          const apiBase = import.meta.env.PROD ? (import.meta.env.VITE_API_BASE || '') : '';
          const response = await fetch(`${apiBase}/api/progress`, {
            headers: {
              'Authorization': `Bearer ${authToken}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            set({ progressData: data });
          }
        } catch (error) {
          console.error('Failed to fetch user progress:', error);
        }
      },
      saveUserProgress: async () => {
        const { authToken, progressData } = get();
        if (!authToken || !progressData.lastKnownLocation) return;
        try {
          const apiBase = import.meta.env.PROD ? (import.meta.env.VITE_API_BASE || '') : '';
          await fetch(`${apiBase}/api/progress/update`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify(progressData),
          });
        } catch (error) {
          console.error('Failed to save user progress:', error);
        }
      },
      updateUserProgress: (data: Partial<QuizState['progressData']>) => {
        // Calculate global progress
        const { lastKnownLocation } = get().progressData;
        const newLocation = data.lastKnownLocation || lastKnownLocation;
        let globalProgressPercentage = 0;

        if (newLocation) {
          const { moduleSlug, lessonSlug, slideNumber } = newLocation;
          const totalSlidesInCourse = getTotalSlideCount();
          let slidesCompletedInPreviousLessons = 0;

          for (const lesson of courseManifest) {
            if (lesson.moduleSlug === moduleSlug && lesson.lessonSlug === lessonSlug) {
              break; // Stop counting when we reach the current lesson
            }
            slidesCompletedInPreviousLessons += lesson.slideCount;
          }

          const totalSlidesCompleted = slidesCompletedInPreviousLessons + slideNumber;

          if (totalSlidesInCourse > 0) {
            globalProgressPercentage = Math.round((totalSlidesCompleted / totalSlidesInCourse) * 100);
          }
        }

        set((state) => ({
          progressData: {
            ...state.progressData,
            ...data,
            globalProgressPercentage,
          },
        }));
      },
      setPromptShown: (shown: boolean) => set({ promptShown: shown }),
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
          .map((q: any, idx: number) => ({ q, idx }))
          .filter(({ q }: { q: any }) => doesConditionPass(answers, q) && q.type !== 'title' && q.type !== 'privacy')
          .map(({ idx }: { idx: number }) => idx);

        const total = visibleIndices.length;
        if (total === 0) {
          set({ progress: 0 });
          return;
        }

        // Position is count of visible items up to and including current index
        const position = visibleIndices.filter((idx: number) => idx <= current).length;
        const percentage = Math.max(0, Math.min(100, (position / total) * 100));

        set({ progress: percentage });
      },
    }),
    {
      name: 'ld-quiz-storage', // name of the item in the storage (must be unique)
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isFetchingUser = true; // Set fetching status on rehydration
        }
      },
    }
  )
);

// Listen for Firebase auth state changes and update the store
onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    // User is signed in.
    useQuizStore.setState({ firebaseUser, isFetchingUser: true });

    const token = await firebaseUser.getIdToken();
    useQuizStore.setState({ authToken: token });
    Cookies.set('ld_auth_token', token, { expires: 7 }); // Persist token in cookie for SSR or page refresh cases

    const { creationTime, lastSignInTime } = firebaseUser.metadata;
    // Add a small buffer (e.g., 2 seconds) to account for clock drift.
    const isNewUser = (new Date(lastSignInTime!).getTime() - new Date(creationTime!).getTime()) < 2000;


    if (isNewUser) {
      // For new users, the `submitQuiz` action handles creating the user in the DB
      // and setting the user state. We will not fetch the user here to avoid a race condition.
      // The user object will be populated by the createUserInDb function.
      useQuizStore.setState({ isFetchingUser: false });
    } else {
      // Returning user flow
      await useQuizStore.getState().fetchUser();
      await useQuizStore.getState().fetchUserProgress();
      useQuizStore.setState({ isFetchingUser: false });
    }
  } else {
    // User is signed out.
    useQuizStore.getState().clearAuth();
    Cookies.remove('ld_auth_token');
  }
});

export default useQuizStore; 