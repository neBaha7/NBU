import { useState } from 'react';

export default function SearchBar({ onSearch, isLoading }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative group">
        {/* Search icon */}
        <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            className="text-apple-secondary group-focus-within:text-electric transition-colors duration-200"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </div>

        {/* Input */}
        <input
          id="search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question about corporate financial documents..."
          disabled={isLoading}
          className={`
            w-full pl-14 pr-14 py-4
            bg-white rounded-full
            text-base text-apple-text placeholder-apple-secondary/60
            border border-apple-border/60
            shadow-apple
            outline-none
            transition-all duration-300 ease-out
            focus:border-electric/40 focus:shadow-glow
            hover:shadow-apple-hover hover:border-apple-border
            disabled:opacity-60 disabled:cursor-not-allowed
          `}
          autoComplete="off"
        />

        {/* Submit icon */}
        <button
          type="submit"
          disabled={!query.trim() || isLoading}
          className={`
            absolute right-3 top-1/2 -translate-y-1/2
            w-9 h-9 rounded-full flex items-center justify-center
            transition-all duration-200
            ${query.trim() && !isLoading
              ? 'bg-electric text-white hover:bg-electric-600 scale-100 opacity-100'
              : 'bg-transparent text-apple-secondary scale-90 opacity-0'
            }
          `}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Hint text */}
      <p className="text-center text-xs text-apple-secondary/70 mt-3 font-light">
        Try: "What was NBU's revenue for fiscal year 2134?" or "Summarize risk exposure"
      </p>
    </form>
  );
}
