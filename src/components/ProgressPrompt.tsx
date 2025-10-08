import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useQuizStore from '../store';

const ProgressPrompt = () => {
  const navigate = useNavigate();
  const { progressData, promptShown, setPromptShown } = useQuizStore();
  const { lastKnownLocation, lessonSlug } = progressData;

  useEffect(() => {
    if (lastKnownLocation && !promptShown) {
      // Format the lesson slug for display
      // e.g., 'introduction-to-longevity-science' -> 'Introduction To Longevity Science'
      const lessonTitle = lessonSlug
        ? lessonSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        : 'your lesson';

      toast(
        (t) => (
          <div className="flex flex-col gap-2">
            <p>
              Welcome back! Continue where you left off in{' '}
              <span className="font-semibold">{lessonTitle}</span>?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigate(lastKnownLocation);
                  toast.dismiss(t.id);
                }}
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Continue
              </button>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Dismiss
              </button>
            </div>
          </div>
        ),
        {
          duration: 10000, // Keep the toast up for 10 seconds
          position: 'top-center',
        }
      );
      setPromptShown(true);
    }
  }, [lastKnownLocation, lessonSlug, navigate, promptShown, setPromptShown]);

  return null; // This component is non-rendering
};

export default ProgressPrompt;

