// course-manifest.ts

/**
 * IMPORTANT: This file serves as a centralized manifest for the entire curriculum structure.
 * It must be manually updated whenever a new module or lesson is added to the course.
 * The order of lessons in this array determines the calculation of global course progress.
 */

export interface CourseManifestItem {
  moduleSlug: string;
  lessonSlug: string;
  slideCount: number;
}

export const courseManifest: CourseManifestItem[] = [
  // Module 1: Longevity Fundamentals
  {
    moduleSlug: 'longevity-fundamentals',
    lessonSlug: 'introduction-to-longevity-science',
    slideCount: 9,
  },
  // --- ADD NEW LESSONS HERE ---
  // Example:
  // {
  //   moduleSlug: 'longevity-fundamentals',
  //   lessonSlug: 'another-lesson',
  //   slideCount: 12,
  // },
  // {
  //   moduleSlug: 'a-new-module',
  //   lessonSlug: 'its-first-lesson',
  //   slideCount: 15,
  // },
];

// Helper function to get the total number of slides in the entire course
export const getTotalSlideCount = (): number => {
  return courseManifest.reduce((total, lesson) => total + lesson.slideCount, 0);
};

