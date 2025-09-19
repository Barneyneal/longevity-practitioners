
import { useLocation, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import useQuizStore from '../../store';
import LoadingDots from '../../components/LoadingDots';
import { useEffect, useState } from 'react';
import Accordion from '../../components/accordion';

const ResultsPage = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const { submissions, isFetchingSubmissions } = useQuizStore();
  const submission = submissions.find(s => s._id === submissionId);
  const location = useLocation() as any;

  const [resultDoc, setResultDoc] = useState<any | null>(null);
  const [isLoadingResult, setIsLoadingResult] = useState(false);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.12, delayChildren: 0.2 },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  } as const;

  useEffect(() => {
    const load = async () => {
      if (!submissionId) return;
      // Use prefetched result if provided via navigation state
      const prefetched = location?.state?.prefetchedResult;
      if (prefetched) {
        setResultDoc(prefetched);
        return;
      }
      setIsLoadingResult(true);
      try {
        const resp = await fetch(`/api/results/get?submissionId=${submissionId}`);
        if (resp.ok) {
          const data = await resp.json();
          setResultDoc(data);
        }
      } finally {
        setIsLoadingResult(false);
      }
    };
    load();
  }, [submissionId]);

  if ((isFetchingSubmissions && !submission) || isLoadingResult) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <LoadingDots />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-lg text-gray-600">Submission not found.</p>
      </div>
    );
  }

  if (!resultDoc) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-lg text-gray-600">Results not available yet.</p>
      </div>
    );
  }

  const quizId = resultDoc.quiz_id as string;
  const heroSrc = quizId === 'cardiac_health' ? '/results/cardiac-health-insights.png' : '/results/longevity-health-insights.png';
  const keyImage = quizId === 'cardiac_health' ? '/results/key-insights-cardiac.png' : '/results/key-insights-longevity.png';
  const content = resultDoc.content || {};

  const accordionItems = (content.category_breakdown || []).map((cat: any) => ({
    title: `${cat.title}`,
    icon: <span className="w-5 h-5 rounded-full bg-gray-300" />,
    content: (
      <div className="pt-4 pb-8 text-gray-700 text-left">
        <p className="font-semibold mb-2">{cat.descriptor} • Score {cat.score}</p>
        <p className="leading-relaxed">{cat.explanationParagraph}</p>
      </div>
    )
  }));

  return (
    <motion.div className="w-full mx-auto pb-32 px-4" initial="hidden" animate="visible" variants={containerVariants}>
      <motion.div className="mb-4 pt-6" variants={itemVariants}>
        <img src={heroSrc} alt="Insights" className="w-full rounded-2xl object-cover" />
      </motion.div>

      <motion.div className="grid grid-cols-3 gap-3 items-stretch mb-6" variants={itemVariants}>
        <div className="col-span-2 py-4 pl-5 pr-4 border rounded-full bg-white text-gray-800 border-gray-300 h-full">
          <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between">
            <span className="font-medium text-lg md:text-lg">{quizId === 'cardiac_health' ? 'Cardiac Health' : 'Longevity Quiz'}</span>
            <span className="text-sm text-gray-500">{new Date(submission.submittedAt).toLocaleString()}</span>
          </div>
        </div>
        <div className="col-span-1 h-full flex items-center space-x-2">
          <button className="flex-grow h-full border rounded-full text-center transition-colors bg-blue-500 text-white border-blue-500 hover:bg-blue-600" onClick={() => window.history.back()}>
            Retake
          </button>
        </div>
      </motion.div>

      {/* Intro */}
      {content.intro && (
        <motion.p className="text-gray-700 mb-6 leading-relaxed text-left" variants={itemVariants}>{content.intro}</motion.p>
      )}

      {/* Overall summary */}
      {content.overall_summary && (
        <motion.div className="mb-6 text-left" variants={itemVariants}>
          {(() => {
            const s = content.overall_summary || {};
            let items: { label: string; value: any }[] = [];

            if (quizId === 'cardiac_health') {
              if (s.cardiacRiskScore !== undefined) {
                const scoreValue = typeof s.cardiacRiskScore === 'number' ? `${s.cardiacRiskScore}%` : s.cardiacRiskScore;
                items.push({ label: 'Cardiac Risk Score', value: scoreValue });
              }
              const riskDescriptor = s.riskDescriptor ?? s.cardiacRiskProfile;
              if (riskDescriptor !== undefined) {
                items.push({ label: 'Risk Level', value: riskDescriptor });
              }
            } else {
              if (s.biologicalAge !== undefined) items.push({ label: 'Biological Age', value: s.biologicalAge });
              if (s.chronologicalAge !== undefined) items.push({ label: 'Chronological Age', value: s.chronologicalAge });
              if (s.longevityFactor !== undefined) items.push({ label: 'Longevity Factor', value: s.longevityFactor });
            }

            return (
              <div className="text-gray-800 mb-3 text-lg flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center">
                {items.map((m, idx) => (
                  <span key={idx}><span className="font-semibold">{m.label}:</span> {m.value}</span>
                ))}
              </div>
            );
          })()}
          {content.summaryParagraph && (
            <p className="text-gray-700 leading-relaxed text-left">{content.summaryParagraph}</p>
          )}
        </motion.div>
      )}

      {/* Accordion */}
      {accordionItems.length > 0 && (
        <motion.div className="mb-8" variants={itemVariants}>
          <Accordion items={accordionItems} />
        </motion.div>
      )}

      {/* Key image */}
      <motion.div className="my-6" variants={itemVariants}>
        <img src={keyImage} alt="Key Action Plan" className="w-full rounded-2xl object-cover" />
      </motion.div>

      {/* Focus areas */}
      {content.focus_areas && (
        <motion.div className="mb-8 text-left" variants={itemVariants}>
          {content.focus_areas.introParagraph && (
            <p className="text-gray-700 mb-4 leading-relaxed">{content.focus_areas.introParagraph}</p>
          )}
          {(content.focus_areas.topRecommendations || []).map((rec: any, idx: number) => (
            <motion.div key={idx} className="mb-6" variants={itemVariants}>
              <h3 className="text-xl font-semibold mb-2">{rec.area}</h3>
              {rec.userAnswer && (
                <p className="text-base text-gray-600 my-4">Your answer: <span className="text-lg italic text-gray-700">{rec.userAnswer}</span></p>
              )}
              <p className="text-gray-700 leading-relaxed">{rec.recommendation}</p>
              <div className="my-8 flex items-center">
                <div className="w-3/5 h-px bg-gray-300 mx-auto" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Safety note (placeholder) */}
      <motion.p className="text-gray-700 mb-6 text-left" variants={itemVariants}>If any symptoms suggest concerning or worsening conditions (e.g., chest pain, severe shortness of breath, rapidly worsening swelling), seek prompt medical care.</motion.p>

      {/* Outro */}
      {content.outro && (
        <motion.p className="text-gray-700 leading-relaxed text-left" variants={itemVariants}>{content.outro}</motion.p>
      )}
    </motion.div>
  );
};

export default ResultsPage;
