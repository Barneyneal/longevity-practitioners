import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useQuizStore from '../store';
import { useDebouncedCallback } from 'use-debounce';

// A simple no-op change to trigger a linter refresh.
const ActivityTracker = () => {
  const location = useLocation();
  const { updateUserProgress, saveUserProgress } = useQuizStore();

  // Debounce the save function to avoid spamming the API on every slide change
  const debouncedSave = useDebouncedCallback(() => {
    saveUserProgress();
  }, 3000); // Save after 3 seconds of inactivity

  useEffect(() => {
    const { pathname, search } = location;
    const fullPath = `${pathname}${search}`;

    // We only want to track progress within the course content itself
    if (pathname.startsWith('/course/')) {
      const pathParts = pathname.split('/').filter(Boolean); // e.g., ['course', 'module-slug', 'lesson-slug', '1']
      const slideNumberStr = pathParts[3];

      // Only track location if the path corresponds to a slide (i.e., the 4th segment is a number)
      if (slideNumberStr && !isNaN(parseInt(slideNumberStr, 10))) {
        const progressData = {
          lastKnownLocation: fullPath,
          moduleSlug: pathParts[1] || null,
          lessonSlug: pathParts[2] || null,
          slideNumber: parseInt(slideNumberStr, 10),
        };
        
        updateUserProgress(progressData);
        debouncedSave();
      }
    }
  }, [location, updateUserProgress, debouncedSave]);

  return null; // This component does not render anything
};

export default ActivityTracker;
