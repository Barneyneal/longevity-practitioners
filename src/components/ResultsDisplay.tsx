import React from 'react';
import Accordion from './Accordion';
import RecommendationItem from './RecommendationItem';
import { motion } from 'framer-motion';
import AnimatedText from './AnimatedText';

const ResultsDisplay = ({ submission }: { submission: any }) => {
  if (!submission.result) {
    return <p className="text-center p-8">Your detailed results are being generated and will be available here shortly.</p>;
  }
  
  const data = submission.result.content || submission.result;

  const formatQuizId = (quizId: string) => {
    return quizId
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const accordionItems = (data.categoryBreakdown || data.category_breakdown || []).map((category: any, index: number) => ({
    title: category.title,
    // Placeholder icon
    icon: <span className="text-2xl">{['❤️', '🔬', '🥦', '🏃‍♂️', '💊', '👨‍👩‍👧‍👦', '🧠'][index] || '⭐'}</span>,
    content: (
      <div className="p-4">
        <p className="font-semibold text-lg text-gray-800 mb-2">{category.descriptor}</p>
        <p className="text-gray-600">{category.explanationParagraph}</p>
      </div>
    )
  }));

  return (
    <div className="w-full mx-auto p-6 bg-white min-h-screen">
        {/* Introduction */}
        <AnimatedText
          text={data.intro}
          el="h1"
          className="text-2xl md:text-3xl font-light mb-8"
          style={{ lineHeight: '1.2em', paddingBottom: '10px' }}
          animationType="word"
          delay={0.5}
          stagger={0.0625}
          duration={0.375}
        />

        {/* Overall Summary */}
        <div className="bg-white rounded-lg shadow p-6 mb-8 text-left">
            {(data.overallSummary || data.overall_summary)?.cardiacRiskScore !== undefined && (
            <>
                <p className="text-gray-600">Your Risk Score</p>
                <p className="text-4xl font-bold text-gray-800">
                    {(data.overallSummary || data.overall_summary).cardiacRiskScore}
                    <span className="text-2xl font-light"> / 100</span>
                </p>
                <p className="font-semibold text-blue-600 mt-1">{(data.overallSummary || data.overall_summary).riskDescriptor}</p>
            </>
            )}
            {(data.overallSummary || data.overall_summary)?.biologicalAge !== undefined && (
            <>
                <p className="text-gray-600">Your Biological Age</p>
                <p className="text-4xl font-bold text-gray-800">
                    {(data.overallSummary || data.overall_summary).biologicalAge}
                </p>
                <p className="font-semibold text-blue-600 mt-1">
                    vs. Chronological Age of {(data.overallSummary || data.overall_summary).chronologicalAge}
                </p>
            </>
            )}
        </div>
        
        {/* Category Breakdown */}
        <div className="mb-8">
            <Accordion items={accordionItems} />
        </div>

        {/* Your Key Action Plan */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center mb-4">
                {/* Placeholder image */}
                <div className="w-16 h-16 bg-gray-200 rounded-full mr-4"></div>
                <h3 className="text-2xl font-bold text-gray-800">Your Key Action Plan</h3>
            </div>
            <p className="text-gray-700 mb-6">{(data.focusAreas || data.focus_areas)?.introParagraph}</p>
            
            <div className="space-y-4">
                {(data.focusAreas || data.focus_areas)?.topRecommendations.map((rec: any, index: number) => (
                    <RecommendationItem
                        key={index}
                        area={rec.area}
                        userAnswer={rec.userAnswer}
                        recommendation={rec.recommendation}
                    />
                ))}
            </div>
        </div>

        {/* Safety Note & Outro */}
        <div className="text-sm text-gray-600 space-y-4">
            <p><strong>Safety Note:</strong> {data.safetyNote || data.safety_note}</p>
            <p>{data.outro}</p>
        </div>
    </div>
  );
};

export default ResultsDisplay;
