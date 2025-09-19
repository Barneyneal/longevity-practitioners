import useQuizStore from '../store';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import AnimatedText from '../components/AnimatedText';
import LoadingDots from '../components/LoadingDots';
import ResultsPollButton from '../components/ResultsPollButton';

const formatQuizLabel = (quizId: string) => {
  return quizId === 'longevity' ? 'Longevity Quiz' : 'Cardiac Health';
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const DashboardPage = () => {
  const { user, submissions, isFetchingSubmissions, resetQuiz, startQuiz } = useQuizStore();
  const navigate = useNavigate();

  const handleRetake = (e: React.MouseEvent, quizId: string) => {
    e.preventDefault();
    e.stopPropagation();
    resetQuiz(quizId);
    startQuiz(quizId);
    navigate(quizId === 'longevity' ? '/longevity-quiz' : '/cardiac-health-quiz');
  };

  const greeting = getGreeting();

  return (
    <div className="w-full mx-auto p-6">
      <div className="text-left mb-8">
        {isFetchingSubmissions && !submissions.length ? (
          <div className="flex justify-center"><LoadingDots /></div>
        ) : (
          user?.firstName && (
            <>
              <AnimatedText
                el="h1"
                text={`${greeting} ${user.firstName}, are you ready to view your results?`}
                animationType="word"
                className="text-[34px] md:text-4xl font-light mb-2"
                style={{ lineHeight: '1.2em', paddingBottom: '10px' }}
              />
              <AnimatedText
                key="dashboard-subtitle"
                text="Your results are a powerful starting point, but it’s what you do next that truly changes your healthspan. Explore our physician‑guided longevity programs to turn insights into action. Initial score processing can take up to 5 minutes on first submission; your results will appear here automatically. Powered by The Longevity AI."
                el="p"
                className="text-gray-600"
                animationType="word"
                delay={1}
                stagger={0.0625}
                duration={0.375}
              />
            </>
          )
        )}
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.3, // Changed from 0.1 to 0.3
              delayChildren: 0.5,
            },
          },
        }}
        className="space-y-4"
      >
        {submissions.map((submission) => (
          <motion.div
            key={submission._id}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { 
                opacity: 1, 
                y: 0,
                transition: { duration: 0.5 }
              },
            }}
            className="grid grid-cols-3 gap-3 items-stretch"
          >
            <div className="col-span-2 py-4 pl-5 pr-4 border rounded-full bg-white text-gray-800 border-gray-300 h-full">
              <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between">
                <span className="font-medium text-lg md:text-lg">{formatQuizLabel(submission.quizId)}</span>
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(submission.submittedAt), { addSuffix: true })}
                  </span>
                  <button
                    onClick={(e) => handleRetake(e, submission.quizId)}
                    className="p-0 rounded-full"
                    title="Retake Quiz"
                  >
                    <img src="/retake.svg" alt="Retake" className="w-5 h-5" />
                  </button>
                </div>
                <span className="md:hidden text-sm text-gray-500">
                  {formatDistanceToNow(new Date(submission.submittedAt), { addSuffix: true })}
                </span>
              </div>
            </div>
            <div className="col-span-1 h-full flex items-center">
              <div className="flex-grow h-full">
                <ResultsPollButton submissionId={submission._id} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default DashboardPage;
