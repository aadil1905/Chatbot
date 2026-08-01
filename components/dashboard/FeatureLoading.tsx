export default function FeatureLoading({ title = "Loading" }: { title?: string }) {
  return (
    <div className="dashboard-enter mx-auto max-w-7xl space-y-6">
      <div className="space-y-3">
        <div className="h-4 w-36 animate-pulse rounded-full bg-sky-100" />
        <div className="h-10 w-72 animate-pulse rounded-2xl bg-white/80 shadow-sm" />
        <p className="text-sm text-muted-foreground">{title}...</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-2xl border border-white/80 bg-white/70 shadow-sm"
          />
        ))}
      </div>

      <div className="h-96 animate-pulse rounded-3xl border border-white/80 bg-white/70 shadow-[0_18px_45px_rgba(72,105,152,.08)]" />
    </div>
  );
}
