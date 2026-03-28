import { useState, useCallback } from 'react';
import SearchBar from '../components/SearchBar';
import AnswerCard from '../components/AnswerCard';
import SourceTag from '../components/SourceTag';
import LoadingPulse from '../components/LoadingPulse';
import { searchDocuments } from '../services/mockApi';

export default function SearchPage() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async (query) => {
    setIsLoading(true);
    setHasSearched(true);
    setResult(null);

    try {
      const data = await searchDocuments(query);
      setResult(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <main className="min-h-screen pt-14">
      {/* Search hero section */}
      <section
        className={`
          transition-all duration-700 ease-out
          ${hasSearched ? 'pt-10 pb-8' : 'pt-[28vh] pb-16'}
        `}
      >
        <div className="max-w-5xl mx-auto px-6">
          {/* Title — only shown before first search */}
          <div
            className={`
              text-center mb-8 transition-all duration-500
              ${hasSearched ? 'opacity-0 h-0 mb-0 overflow-hidden' : 'opacity-100'}
            `}
          >
            <h1 className="text-4xl sm:text-5xl font-semibold text-apple-text tracking-tight mb-4">
              Document Intelligence
            </h1>
            <p className="text-lg text-apple-secondary font-light max-w-lg mx-auto leading-relaxed">
              Ask questions about corporate financial documents.
              <br />
              Powered by AI retrieval-augmented generation.
            </p>
          </div>

          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </div>
      </section>

      {/* Results section */}
      {(isLoading || result) && (
        <section className="max-w-3xl mx-auto px-6 pb-24">
          {isLoading ? (
            <LoadingPulse />
          ) : result ? (
            <div className="space-y-8">
              {/* Answer */}
              <AnswerCard
                answer={result.answer}
                processingTimeMs={result.processingTimeMs}
              />

              {/* Sources */}
              <div className="animate-fade-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
                <div className="flex items-center gap-2 mb-4 ml-1">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#86868B"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  <h2 className="text-sm font-semibold text-apple-secondary uppercase tracking-wider">
                    Relevant Sources
                  </h2>
                  <span className="text-xs text-apple-secondary/50 font-light">
                    ({result.sources.length})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.sources.map((source, idx) => (
                    <SourceTag
                      key={source.id}
                      filename={source.filename}
                      sheet={source.sheet}
                      relevance={source.relevance}
                      index={idx}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </section>
      )}
    </main>
  );
}
