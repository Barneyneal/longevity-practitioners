# Ultimate Longevity Quiz

This project is a modular, extensible quiz application built with React, TypeScript, and Vite. It is designed to be easily adaptable for various types of quizzes, with the initial implementation being a Longevity Quiz.

## Project Structure

The application is structured to support multiple quizzes, with a clear separation between shared components and quiz-specific logic.

-   `src/components`: Contains all the reusable components that can be shared across different quizzes (e.g., `Question`, `TitlePage`, `Header`).
-   `src/pages`: Contains the different quizzes, with each quiz in its own subdirectory.
    -   `src/pages/LongevityQuiz`: Contains all the files specific to the Longevity Quiz, including the questions and the main quiz page component.
-   `src/store.ts`: The Zustand store, which is designed to manage the state of multiple quizzes simultaneously.

## Getting Started

To get started with the project, follow these steps:

1.  **Install Dependencies:**
    Navigate to the `frontend` directory and run the following command to install the required dependencies:
    ```bash
    npm install
    ```

2.  **Run the Development Server:**
    Once the dependencies are installed, you can start the development server with this command:
    ```bash
    npm run dev
    ```
    This will start the application on a local server, typically at `http://localhost:5173`.

## Adding a New Quiz

To add a new quiz (e.g., a "Cardiac Health Quiz"), you would follow these steps:

1.  **Create a New Quiz Directory:**
    Create a new directory for your quiz under `src/pages` (e.g., `src/pages/CardiacHealthQuiz`).

2.  **Add Questions:**
    Create a `questions.ts` file in your new directory with the questions for your quiz.

3.  **Create the Quiz Page:**
    Create a main page component for your quiz (e.g., `CardiacHealthQuizPage.tsx`) that will render the questions and other components.

4.  **Add a Route:**
    In `App.tsx`, add a new route for your quiz in the `<Routes>` section.
