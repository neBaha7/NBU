export default function SourceTag({ filename, sheet, relevance, index }) {
  const relevancePercent = Math.round(relevance * 100);

  return (
    <div
      className="animate-fade-up group cursor-default"
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}
    >
      <div
        className={`
          flex items-center gap-3 px-5 py-3
          bg-white rounded-full
          border border-apple-border/40
          shadow-sm
          transition-all duration-200 ease-out
          hover:shadow-apple hover:border-apple-border/70
          hover:-translate-y-0.5
        `}
      >
        {/* File icon */}
        <div className="w-7 h-7 rounded-lg bg-apple-bg flex items-center justify-center flex-shrink-0">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#86868B"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="group-hover:stroke-electric transition-colors duration-200"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </div>

        {/* Name and sheet */}
        <div className="min-w-0 flex-1">
          <span className="text-sm font-medium text-apple-text truncate block">
            {filename}
          </span>
          <span className="text-xs text-apple-secondary font-light truncate block">
            {sheet}
          </span>
        </div>

        {/* Relevance badge */}
        <span
          className={`
            text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0
            ${relevancePercent >= 90
              ? 'bg-electric/10 text-electric'
              : relevancePercent >= 80
                ? 'bg-green-50 text-green-600'
                : 'bg-apple-bg text-apple-secondary'
            }
          `}
        >
          {relevancePercent}%
        </span>
      </div>
    </div>
  );
}
