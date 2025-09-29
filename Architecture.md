# Longevity Practitioners Learning Platform — Architecture Briefing

## Overview

This project is a modular React + TypeScript single-page application (SPA) built with Vite. It has been refactored from a multi-quiz engine into a learning management system (LMS) designed to deliver comprehensive, science-backed courses. The flagship course is the "Mastering Longevity: The 5-Hour Foundational Framework." The platform features a dynamic course curriculum browser, a slide-based lesson viewer with synchronized audio and citations, a reusable component library, client-side state via Zustand, and a lightweight serverless API (Vercel) backed by MongoDB for user management and the initial onboarding assessment.

## Tech stack

- React 18 + TypeScript
- Vite 5 + @vitejs/plugin-react
- Tailwind CSS for styling
- Zustand for state management
- react-router-dom for routing
- Framer Motion for animations
- react-markdown for rendering course content
- MongoDB for persistence
- Vercel serverless functions for API
- JSON Web Tokens (JWT) for auth

## Project structure

  - `_api/` — Serverless API handlers (Vercel). Mounted under `/api/*` in dev/prod.
    - `auth/` — `login.ts`, `register.ts`
  - `submissions/` — `create.ts`, `me.ts` (for onboarding assessment)
    - `users/` — `me.ts`
  - `src/` — Frontend app
    - `main.tsx` — React entry
    - `App.tsx` — Router, layout shell, route definitions
  - `components/` — Reusable UI primitives
    - Course Components: `ModuleAccordion.tsx`, `LessonAccordion.tsx`, `LessonHeader.tsx`, `AudioPlayer.tsx`
    - Shared Components: `Header.tsx`, `Logo.tsx`, `ProtectedRoute.tsx`, `AnimatedText.tsx`
    - `pages/`
    - `HomePage.tsx` — Landing page
    - `LoginPage.tsx`, `ForgotPasswordPage.tsx`, `ResetPasswordPage.tsx`
    - `DashboardPage.tsx` — Hub for accessing courses
    - `Onboarding/` — The initial user assessment (formerly Longevity Quiz)
    - `MasteringHealthspanFramework/` — The main page for the "Mastering Longevity" course.
    - `LessonSlidePage.tsx` — The generic page template for rendering a lesson's slides.
  - `course-data/` — Contains the raw content for all courses.
    - `longevity-fundamentals/` (Example module)
      - `introduction-to-longevity-science/` (Example lesson)
        - `slides.md`: Markdown content for the lesson's slides.
        - `index.json`: Manifest file mapping slides to audio and citation IDs.
        - `citations.json`: All citations for the lesson.
        - `audio/`: Directory containing audio files for each slide.
  - `store.ts` — Zustand store (user auth, onboarding assessment state)
- `CuriculumBreakdown.json` — The master JSON file defining the structure of all courses, modules, and lessons.

## Routing and pages

Routes are defined in `src/App.tsx` using `BrowserRouter`:

- `/` — `HomePage`
- `/onboarding` — `OnboardingPage`
- `/mastering-longevity` — `MasteringHealthspanFrameworkPage`
- `/course/:moduleSlug/:lessonSlug` — `LessonSlidePage`
- `/login`, `/forgot-password`, `/reset-password`
- Protected via `ProtectedRoute`:
  - `/dashboard` — `DashboardPage`

## State management (Zustand)

`src/store.ts` manages:
- Auth (`authToken`, `user`) with cookie/localStorage persistence
- User and submission data for the onboarding assessment (`fetchSubmissions`, `fetchUser`)
- The state for the onboarding assessment itself (navigation, answers, etc.)

*Note: The core course progression and state is managed locally by the components themselves (`LessonSlidePage`, etc.) and not in the central Zustand store.*

## Course Content and Delivery

The course structure is defined by a hierarchy of JSON and Markdown files.

-   **`CuriculumBreakdown.json`**: The single source of truth for the course structure. It contains an array of modules, which in turn contain an array of lessons, along with metadata like titles, durations, and URL slugs.
-   **Lesson Folder**: Each lesson has its own folder within `src/course-data`.
    -   **`slides.md`**: A Markdown file where each `##` heading defines a new slide. This allows for easy content creation.
    -   **`index.json`**: A manifest file that links the content in `slides.md` to its corresponding audio file and citations.
    -   **`citations.json`**: A flat list of all reference materials for the lesson.
    -   **`audio/`**: A folder containing the audio narration for each slide.
-   **Rendering**:
    -   `MasteringHealthspanFrameworkPage` reads `CuriculumBreakdown.json` to render the nested `ModuleAccordion` and `LessonAccordion` components.
    -   `LessonSlidePage` dynamically imports the `slides.md`, `index.json`, and `citations.json` for the requested lesson. It uses `react-markdown` to render the slide content and manages the state for the current slide, audio playback, and the cumulative list of citations.

## Onboarding Assessment Flow

The initial "Longevity Quiz" has been repurposed as a user onboarding assessment. The original quiz engine logic in `store.ts` and the API endpoints under `/api/submissions/` are still used for this flow.

- Schema: Questions are defined in `src/pages/Onboarding/onboarding-questions.ts`.
- Submission: Answers are sent to `/api/submissions/create`, which validates and saves them. This flow can also create a new user account.

## Serverless API

The API handles user authentication and the onboarding assessment data.

- Auth
  - `POST /api/auth/register` — creates user, hashes password (bcrypt), returns JWT
  - `POST /api/auth/login` — verifies credentials, returns JWT
- Users
  - `GET /api/users/me` — JWT-protected, returns user sans password
- Submissions (Onboarding)
  - `POST /api/submissions/create` — validates, scores, persists submission
  - `GET /api/submissions/me` — JWT-protected, returns user submissions

## Extensibility guidelines

- Adding a new course:
  1) Create a new content directory under `src/course-data/`.
  2) Add the new module and lesson structure to `CuriculumBreakdown.json`.
  3) Populate the new lesson folders with `slides.md`, `index.json`, `citations.json`, and audio files.
  4) Add a link to the new course on the `DashboardPage`. The existing `/course/:moduleSlug/:lessonSlug` route and `LessonSlidePage` component are designed to be reusable.

## Data shapes (high-level)

- Submission (Onboarding):
  - `_id`, `userId`, `quizId`, `submittedAt`, `submissionData`
- Course Curriculum (`CuriculumBreakdown.json`):
  - `modules[]` -> `lessons[]` -> `{ title, duration, topics, lessonSlug }`
- Lesson Manifest (`index.json`):
  - `lessonTitle`, `slides[]` -> `{ slideNumber, audio, citationIds[] }`
