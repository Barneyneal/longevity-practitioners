# Longevity Practitioners Learning Platform

This project is a learning management system built with React, TypeScript, and Vite. It is designed to deliver in-depth courses, with the initial implementation being the "Mastering Longevity: The 5-Hour Foundational Framework" course.

## Project Structure

The application is structured to support multiple courses, with a clear separation between shared components and course-specific content and logic.

-   `src/components`: Contains all the reusable components that can be shared across different courses (e.g., `ModuleAccordion`, `LessonAccordion`, `Header`).
-   `src/pages`: Contains the main pages of the application.
    -   `src/pages/Onboarding`: Contains the initial user assessment.
    -   `src/pages/MasteringHealthspanFramework`: The main page for the "Mastering Longevity" course, which displays the curriculum.
    -   `src/pages/LessonSlidePage.tsx`: The template for displaying individual lesson slides with audio and citations.
-   `src/course-data`: Contains the content for each course, separated by module and lesson.
-   `src/store.ts`: The Zustand store, which manages application state.

## Getting Started

To get started with the project, follow these steps:

1.  **Install Dependencies:**
    Navigate to the project directory and run the following command to install the required dependencies:
    ```bash
    npm install
    ```

2.  **Run the Development Server:**
    Once the dependencies are installed, you can start the development server with this command:
    ```bash
    npm run dev
    ```
    This will start the application on a local server, typically at `http://localhost:3000`.

## Adding a New Course

To add a new course, you would follow these steps:

1.  **Create a New Course Content Directory:**
    Create a new directory for your course under `src/course-data` (e.g., `src/course-data/new-course-name`). Structure it with module and lesson subdirectories.

2.  **Add Course Content:**
    Populate the lesson directories with `slides.md`, `index.json`, `citations.json`, and audio files. Update the main `CuriculumBreakdown.json` with the new module and lesson structure.

3.  **Create the Course Page:**
    Create a main page component for your course (e.g., `NewCoursePage.tsx`) that will render the curriculum, likely by reusing the components from `MasteringHealthspanFrameworkPage`.

4.  **Add a Route:**
    In `App.tsx`, add a new route for your course in the `<Routes>` section and add a link to it from the `DashboardPage`.
