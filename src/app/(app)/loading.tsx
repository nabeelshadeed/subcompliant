export default function Loading() {
  return (
    <div className="space-y-5 max-w-7xl animate-pulse">
      <div className="space-y-1.5">
        <div className="h-6 w-48 bg-white/10 rounded-lg" />
        <div className="h-4 w-32 bg-white/5 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-5 space-y-3">
            <div className="h-4 w-24 bg-white/10 rounded" />
            <div className="h-8 w-16 bg-white/10 rounded" />
          </div>
        ))}
      </div>
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10">
          <div className="h-4 w-36 bg-white/10 rounded" />
        </div>
        <div className="divide-y divide-white/10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5">
              <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-40 bg-white/10 rounded" />
                <div className="h-3 w-24 bg-white/5 rounded" />
              </div>
              <div className="h-5 w-16 bg-white/10 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
