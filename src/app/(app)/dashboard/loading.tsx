export default function DashboardLoading() {
  return (
    <div className="space-y-6 max-w-7xl animate-pulse">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="h-7 w-56 bg-white/10 rounded-lg" />
        <div className="h-4 w-40 bg-white/5 rounded-lg" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-5 space-y-3">
            <div className="h-3.5 w-28 bg-white/10 rounded" />
            <div className="h-9 w-14 bg-white/10 rounded" />
            <div className="h-3 w-20 bg-white/5 rounded" />
          </div>
        ))}
      </div>

      {/* Compliance bar */}
      <div className="card p-5 space-y-3">
        <div className="flex justify-between">
          <div className="h-4 w-32 bg-white/10 rounded" />
          <div className="h-4 w-10 bg-white/10 rounded" />
        </div>
        <div className="h-2.5 bg-white/10 rounded-full" />
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, c) => (
          <div key={c} className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10">
              <div className="h-4 w-36 bg-white/10 rounded" />
            </div>
            <div className="divide-y divide-white/10">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-36 bg-white/10 rounded" />
                    <div className="h-3 w-20 bg-white/5 rounded" />
                  </div>
                  <div className="h-5 w-16 bg-white/10 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
