export default function LoadingPulse() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="bg-white rounded-card shadow-apple p-8 lg:p-10">
        {/* Header skeleton */}
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-6 h-6 rounded-full bg-apple-bg animate-pulse-soft" />
          <div className="h-4 w-40 bg-apple-bg rounded-full animate-pulse-soft" />
        </div>

        {/* Text skeleton lines */}
        <div className="space-y-3">
          <div
            className="h-3.5 bg-apple-bg rounded-full animate-pulse-soft"
            style={{ width: '100%', animationDelay: '0ms' }}
          />
          <div
            className="h-3.5 bg-apple-bg rounded-full animate-pulse-soft"
            style={{ width: '92%', animationDelay: '150ms' }}
          />
          <div
            className="h-3.5 bg-apple-bg rounded-full animate-pulse-soft"
            style={{ width: '87%', animationDelay: '300ms' }}
          />
          <div className="h-4" />
          <div
            className="h-3.5 bg-apple-bg rounded-full animate-pulse-soft"
            style={{ width: '95%', animationDelay: '100ms' }}
          />
          <div
            className="h-3.5 bg-apple-bg rounded-full animate-pulse-soft"
            style={{ width: '78%', animationDelay: '250ms' }}
          />
          <div
            className="h-3.5 bg-apple-bg rounded-full animate-pulse-soft"
            style={{ width: '83%', animationDelay: '400ms' }}
          />
        </div>
      </div>

      {/* Sources skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-36 bg-apple-bg/60 rounded-full animate-pulse-soft ml-1" />
        <div className="flex flex-wrap gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-14 bg-white rounded-full border border-apple-border/30 animate-pulse-soft"
              style={{
                width: `${160 + i * 30}px`,
                animationDelay: `${i * 120}ms`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
