import React from 'react';

const InlineSpinner: React.FC = () => {
  return (
    <span className="inline-flex items-center">
      <span className="w-1.5 h-1.5 bg-white/90 rounded-full mx-0.5 animate-bounce [animation-delay:-0.2s]"></span>
      <span className="w-1.5 h-1.5 bg-white/90 rounded-full mx-0.5 animate-bounce"></span>
      <span className="w-1.5 h-1.5 bg-white/90 rounded-full mx-0.5 animate-bounce [animation-delay:0.2s]"></span>
    </span>
  );
};

export default InlineSpinner;
