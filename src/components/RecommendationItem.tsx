import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RecommendationItem = ({ area, userAnswer, recommendation }: { area: string, userAnswer: string, recommendation: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine if the recommendation is long enough to need a "Read More" button
  const needsReadMore = recommendation.length > 250; // Character count threshold

  return (
    <div className="py-4 border-b last:border-b-0">
      <h4 className="font-semibold text-gray-800 text-lg mb-2">{area}</h4>
      
      <div className="text-gray-600 prose">
        <AnimatePresence initial={false}>
          {isExpanded || !needsReadMore ? (
            <motion.div
              key="full"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <p>{recommendation}</p>
            </motion.div>
          ) : (
             <motion.div key="truncated">
               <p>
                 {recommendation.substring(0, 250)}...
               </p>
             </motion.div>
          )}
        </AnimatePresence>
        
        {needsReadMore && (
           <button 
             onClick={() => setIsExpanded(!isExpanded)}
             className="text-blue-600 font-semibold hover:underline mt-2"
           >
             {isExpanded ? 'Read Less' : 'Read More'}
           </button>
        )}
      </div>
    </div>
  );
};

export default RecommendationItem;
