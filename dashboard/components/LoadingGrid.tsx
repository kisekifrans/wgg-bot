export function LoadingGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-4 space-y-3" style={{ animationDelay: `${i * 80}ms` }}>
          <div className="skeleton h-4 w-2/5" />
          <div className="skeleton h-28 w-full rounded-xl" />
          <div className="skeleton h-2.5 w-1/4" />
        </div>
      ))}
    </div>
  );
}
