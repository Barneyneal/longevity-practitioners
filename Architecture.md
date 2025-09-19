# Ultimate Longevity Quiz — Architecture Briefing

## Overview

This project is a modular React + TypeScript single‑page application (SPA) built with Vite that delivers multiple science‑backed self‑assessments: the Longevity Quiz and the Cardiac Health Quiz. It features a reusable quiz engine, animated UX, client‑side state via Zustand, and a lightweight serverless API (Vercel) backed by MongoDB. Results are computed and persisted server‑side, with optional background processing via n8n webhooks.

## Tech stack

- React 18 + TypeScript
- Vite 5 + @vitejs/plugin-react
- Tailwind CSS for styling
- Zustand for state management
- react-router-dom v7 for routing
- Framer Motion for animations
- MongoDB for persistence
- Vercel serverless functions for API
- JSON Web Tokens (JWT) for auth

## Project structure

- `client/`
  - `_api/` — Serverless API handlers (Vercel). Mounted under `/api/*` in dev/prod.
    - `auth/` — `login.ts`, `register.ts`
    - `submissions/` — `create.ts`, `me.ts`
    - `results/` — `create.ts`, `get.ts`
    - `users/` — `me.ts`
    - `lib/` — quiz scoring and validation utilities
      - `assessment.ts` (Longevity scoring)
      - `cardiacAssessment.ts` (Cardiac scoring)
  - `src/` — Frontend app
    - `main.tsx` — React entry
    - `App.tsx` — Router, layout shell, route definitions
    - `components/` — Reusable UI and quiz primitives
      - `Question.tsx`, `TitlePage.tsx`, `PrivacyPage.tsx`, `SectionTitlePage.tsx`, `ThankYouPage.tsx`
      - `Header.tsx`, `ProtectedRoute.tsx`, `AnimatedText.tsx`, `ResultsPollButton.tsx`, etc.
    - `pages/`
      - `HomePage.tsx` — hub for starting quizzes; gated flows
      - `LoginPage.tsx`, `RegisterPage.tsx`
      - `DashboardPage.tsx` — submissions list and results polling
      - `ResultsPage/ResultsPage.tsx` — results viewer
      - `LongevityQuiz/` — page + `questions.ts`
      - `CardiacHealthQuiz/` — page + `questions.ts`
    - `store.ts` — Zustand store and quiz engine (navigation, answers, submission)
  - `vite.config.ts` — dev proxy for n8n webhooks, Vercel integration
  - `README.md`

## Routing and pages

Routes are defined in `src/App.tsx` using `BrowserRouter`:

- `/` — `HomePage`
- `/longevity-quiz` — `LongevityQuizPage`
- `/cardiac-health-quiz` — `CardiacHealthQuizPage`
- `/login` — `LoginPage`
- `/register` — `RegisterPage`
- Protected via `ProtectedRoute`:
  - `/dashboard` — `DashboardPage`
  - `/results/:submissionId` — `ResultsPage`

The `Header` shows a progress bar when inside a quiz route and provides simple back navigation on results and dashboard pages.

## State management (Zustand)

`src/store.ts` manages:
- Active quiz (`activeQuiz`), per‑quiz state (`currentQuestion`, `answers`)
- Progress percentage (computed from visible questions respecting conditional logic)
- Auth (`authToken`, `user`) with localStorage persistence
- Submissions list and fetch status (`fetchSubmissions`, `fetchUser`) with single‑flight and throttling
- Quiz navigation and submission:
  - `startQuiz`, `nextQuestion`, `previousQuestion`, `setAnswer`, `submitAnswer`, `submitQuiz`, `resetQuiz`
  - Conditional question visibility via `condition` fields
- Submission pipeline:
  - Persists minimal submission to `/api/submissions/create`
  - Triggers n8n webhook (via vite proxy in dev: `/proxy/long` or `/proxy/cardiac`; env URLs in prod) to generate full results asynchronously
  - Marks local completion and sets progress to 100%

Auto‑login is performed on load when a token exists; the store decodes JWT locally to prefill `user` and then fetches full user details.

## Quiz engine and flow

- Schema: Each quiz defines a `questions.ts` array with typed items (`QuestionType`). Supported types include `multiple-choice`, `text`, `date`, `height`, `slider`, `name`, `email`, `password`, `section-title`, `title`, `privacy`.
- Conditional logic: Questions can include `condition: { questionId, value }` to gate visibility. The engine skips hidden questions when navigating forward/back.
- Special steps:
  - `TitlePage` at index `-2`
  - `PrivacyPage` at index `-1` (skipped if authenticated)
- Rendering: `Question.tsx` selects the appropriate input control and handles validation (e.g., email, password) and transitions (Framer Motion). `Continue` submits and advances; `multi-choice` answers advance immediately.
- Progress: Calculated from count and position of visible, answerable questions.

### Longevity vs. Cardiac flows

- Longevity Quiz:
  - Can register the user at wrap‑up using `name`, `email`, `password` answers. On successful register, the client stores the JWT and userId before submitting to the serverless API and n8n.
- Cardiac Quiz:
  - Requires an authenticated user (store enforces and alerts otherwise). It enriches scoring using the latest longevity submission data server‑side.

## Results lifecycle

- Client submits answers to `/api/submissions/create` which:
  - Validates sufficiency (e.g., ≥ 2/3 answered for Longevity) using `validateSubmission`
  - Scores server‑side with `runScoring` (Longevity) or `runCardiacScoring` (Cardiac), optionally enriched by the latest Longevity submission
  - Persists a `submissions` document with a structured `submissionData` payload (core metrics, category scores, top improvement areas, submittedAnswers)
  - Returns `submissionId`
- Background results generation (optional): Client triggers n8n webhook with a minimal payload `{ userId, submissionId, quizId }`. n8n can compute narrative/UX content and upsert `results` via `/api/results/create`.
- Display:
  - `DashboardPage` lists submissions (with `$lookup` of any results) via `/api/submissions/me`
  - `ResultsPollButton` polls `/api/results/get?submissionId=...` until ready, then navigates to `/results/:submissionId`
  - `ResultsPage` renders images and structured content returned by results (supports both longevity and cardiac shapes)

## Serverless API

All handlers live under `client/_api/` and are deployed as Vercel functions. Shared Mongo connection helpers are module‑scoped singletons.

- Auth
  - `POST /api/auth/register` — creates user, hashes password (bcrypt), returns JWT
  - `POST /api/auth/login` — verifies credentials, returns JWT
  - JWT payload: `{ userId, email }`, 1‑day expiry; `JWT_SECRET` required
- Users
  - `GET /api/users/me` — JWT‑protected, returns user sans password
- Submissions
  - `POST /api/submissions/create` — validates, scores, persists submission; returns `submissionId`
  - `GET /api/submissions/me` — JWT‑protected, returns user submissions joined with any `results`
- Results
  - `POST /api/results/create` — upserts result content by `submissionId`
  - `GET /api/results/get?submissionId=...` — fetches result doc by `submissionId`

MongoDB database: `ld-quiz` with collections `users`, `submissions`, `results`.

## Environment and configuration

- Required env vars (API):
  - `MONGODB_URI` — Mongo connection string
  - `JWT_SECRET` — JWT signing secret
- Optional env vars (client, for n8n webhooks):
  - `VITE_N8N_LONGEVITY_WEBHOOK_URL`, `VITE_N8N_CARDIAC_WEBHOOK_URL`, `VITE_N8N_WEBHOOK_URL`
  - In dev, `vite.config.ts` proxies `/proxy/long` and `/proxy/cardiac` to the provided absolute URLs
  - `/api` is proxied to `http://localhost:3000` when running Vercel dev

## Build and run

- Install: `npm install`
- Dev: `npm run dev` (Vite). Optionally run `vercel dev` to serve API on port 3000 and enable `/api` proxy.
- Build: `npm run build`
- Preview: `npm run preview`

## Security and access control

- `ProtectedRoute` enforces JWT presence for `/dashboard` and `/results/:submissionId`.
- Client decodes JWT to set `user` and persists token in localStorage; server validates JWT on protected endpoints.
- Cardiac quiz submission requires prior authentication.

## Extensibility guidelines

- Adding a new quiz:
  1) Create `src/pages/NewQuiz/questions.ts` with `QuestionType[]`
  2) Create `NewQuizPage.tsx` (reuse `Question`, `TitlePage`, etc.)
  3) Add a route in `App.tsx` and a tile on `HomePage`
  4) Implement scoring in `_api/lib/<newAssessment>.ts` and extend `_api/submissions/create.ts`
  5) Optionally configure a new n8n webhook and proxy

- Question types: Expand `Question.tsx` to support new input widgets; keep `QuestionType` synchronized.
- Conditional logic: Use `condition` consistently to keep navigation and progress correct.

## Data shapes (high‑level)

- Submission (server):
  - `_id`, `userId`, `quizId`, `submittedAt`, `submissionData` with:
    - `coreMetrics`, `augmentedData`, `categoryScores`, `scoredAnswers`, `topImprovementAreas`, `submittedAnswers`, optional `validation_result`
- Results (server):
  - `submissionId`, `quizId`, `userId`, `content` (free‑form narrative + structured blocks like `overall_summary`, `category_breakdown`, `focus_areas`), `updatedAt`

## UX details worth noting

- Animated copy via `AnimatedText` on hero/section blocks
- Progress bar only on quiz routes and only when a quiz is active
- Results polling with a 5‑minute cap and navigation hand‑off when ready
- Back/retake affordances from header and results actions

## Known nuances

- `GET /api/results/get` currently queries by `submission_id` string; ensure your results writer uses the same key or update for consistency with `ObjectId` usage in `results.create`.
- Longevity submission requires ≥ 2/3 answered; server returns HTTP 422 with validation counts when insufficient.
- In dev, set valid absolute `VITE_N8N_*` URLs to enable proxying; otherwise, the proxy section is omitted.
