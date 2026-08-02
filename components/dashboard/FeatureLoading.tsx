type FeatureLoadingProps = {
  title?: string;
  /** Keeps the skeleton close to the destination layout without introducing a second visual system. */
  columns?: 2 | 3 | 4 | 5;
};

export default function FeatureLoading({ title = "Loading", columns = 4 }: FeatureLoadingProps) {
  return (
    <div className="dashboard-enter mx-auto max-w-7xl space-y-6" role="status" aria-live="polite" aria-label={title}>
      <div className="space-y-3">
        <div className="feature-skeleton h-4 w-36 rounded-full" />
        <div className="feature-skeleton h-10 w-72 rounded-2xl shadow-sm" />
        <p className="flex items-center gap-2 text-sm text-muted-foreground"><span className="feature-loading-spinner" aria-hidden="true" />{title}...</p>
      </div>

      <div className={`grid gap-4 sm:grid-cols-2 ${columns === 5 ? "xl:grid-cols-5" : columns === 4 ? "xl:grid-cols-4" : columns === 3 ? "xl:grid-cols-3" : "xl:grid-cols-2"}`}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="feature-skeleton h-28 rounded-2xl border border-white/80 shadow-sm"
          />
        ))}
      </div>

      <div className="feature-skeleton h-96 rounded-3xl border border-white/80 shadow-[0_18px_45px_rgba(72,105,152,.08)]" />
    </div>
  );
}
