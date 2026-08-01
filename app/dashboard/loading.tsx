function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-3xl border border-white/80 bg-white/70 shadow-[0_18px_45px_rgba(72,105,152,.08)] backdrop-blur-sm ${className}`}
    >
      <div className="h-full w-full animate-pulse bg-gradient-to-r from-slate-100 via-white to-sky-100 bg-[length:240%_100%]" />
    </div>
  );
}

export default function LoadingDashboard() {
  return (
    <div className="dashboard-enter mx-auto max-w-[1550px] space-y-5 pb-8">
      <SkeletonCard className="h-36" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <SkeletonCard key={index} className="h-36" />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <SkeletonCard className="h-[430px]" />
        <SkeletonCard className="h-[430px]" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <SkeletonCard className="h-72" />
        <SkeletonCard className="h-72" />
        <SkeletonCard className="h-72" />
      </div>
    </div>
  );
}
