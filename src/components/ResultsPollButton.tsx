import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ResultsPollButtonProps {
  submissionId: string;
}

const InlineDots: React.FC = () => {
  return (
    <span className="inline-flex ml-1 align-middle">
      <span className="w-1.5 h-1.5 bg-white/90 rounded-full mx-0.5 animate-bounce [animation-delay:-0.2s]"></span>
      <span className="w-1.5 h-1.5 bg-white/90 rounded-full mx-0.5 animate-bounce"></span>
      <span className="w-1.5 h-1.5 bg-white/90 rounded-full mx-0.5 animate-bounce [animation-delay:0.2s]"></span>
    </span>
  );
};

const ResultsPollButton: React.FC<ResultsPollButtonProps> = ({ submissionId }) => {
  const navigate = useNavigate();
  const [isPolling, setIsPolling] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);

  const clearTimer = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const checkOnce = useCallback(async (): Promise<any | null> => {
    try {
      const resp = await fetch(`/api/results/get?submissionId=${submissionId}`, { cache: 'no-store' });
      if (resp.ok) {
        const data = await resp.json();
        return data;
      }
    } catch {
      // ignore network errors and try again
    }
    return null;
  }, [submissionId]);

  const pollUntilReady = useCallback(async () => {
    setIsPolling(true);
    startedAtRef.current = Date.now();

    const loop = async () => {
      const data = await checkOnce();
      if (data) {
        setIsPolling(false);
        navigate(`/results/${submissionId}`, { state: { prefetchedResult: data } });
        return;
      }
      const elapsed = (Date.now() - startedAtRef.current) / 1000;
      if (elapsed >= 300) {
        // Stop after 5 minutes; allow user to try again
        setIsPolling(false);
        return;
      }
      timeoutRef.current = window.setTimeout(loop, 5000);
    };

    loop();
  }, [checkOnce, navigate, submissionId]);

  useEffect(() => () => clearTimer(), []);

  return (
    <button
      className={`w-full h-full border rounded-full text-center transition-colors bg-blue-500 text-white border-blue-500 hover:bg-blue-600 ${isPolling ? 'opacity-90' : ''}`}
      onClick={pollUntilReady}
      disabled={isPolling}
      aria-busy={isPolling}
    >
      {isPolling ? (
        <span className="inline-flex items-center justify-center" aria-live="polite" aria-label="Checking for results">
          <InlineDots />
        </span>
      ) : (
        <span>View Results</span>
      )}
    </button>
  );
};

export default ResultsPollButton;


