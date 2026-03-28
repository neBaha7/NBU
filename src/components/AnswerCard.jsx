import { useState, useEffect, useRef } from 'react';

export default function AnswerCard({ answer, processingTimeMs }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    let i = 0;
    const speed = 8; // ms per character

    intervalRef.current = setInterval(() => {
      if (i < answer.length) {
        setDisplayedText(answer.slice(0, i + 1));
        i++;
      } else {
        clearInterval(intervalRef.current);
        setIsTyping(false);
      }
    }, speed);

    return () => clearInterval(intervalRef.current);
  }, [answer]);

  const handleSkip = () => {
    clearInterval(intervalRef.current);
    setDisplayedText(answer);
    setIsTyping(false);
  };

  return (
    <div className="animate-fade-up">
      <div className="bg-white rounded-card shadow-apple p-8 lg:p-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-electric/10 flex items-center justify-center">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#007AFF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
                <path d="M10 21h4" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-electric tracking-wide uppercase">
              AI-Generated Answer
            </span>
          </div>

          {isTyping && (
            <button
              onClick={handleSkip}
              className="text-xs text-apple-secondary hover:text-apple-text transition-colors px-3 py-1 rounded-full hover:bg-apple-bg"
            >
              Skip animation →
            </button>
          )}
        </div>

        {/* Answer body */}
        <div className="text-[15px] leading-7 text-apple-text/90 whitespace-pre-line font-light">
          <span>{displayedText}</span>
          {isTyping && (
            <span className="typing-cursor" />
          )}
        </div>

        {/* Footer */}
        {!isTyping && processingTimeMs && (
          <div className="mt-6 pt-4 border-t border-apple-border/30 flex items-center gap-3">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#86868B"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-xs text-apple-secondary font-light">
              Processed in {processingTimeMs}ms from {displayedText ? 'multiple sources' : '—'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
