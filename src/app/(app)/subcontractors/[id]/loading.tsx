export default function SubcontractorLoading() {
  return (
    <div className="space-y-5 max-w-5xl animate-pulse">
      <div className="h-4 w-40 bg-gray-200 rounded" />

      <div className="card p-6">
        <div className="flex items-start gap-5">
          <div className="w-14 h-14 rounded-xl bg-gray-200 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-6 w-56 bg-gray-200 rounded" />
            <div className="h-4 w-32 bg-gray-100 rounded" />
            <div className="h-4 w-44 bg-gray-100 rounded" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 space-y-3">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-2 bg-gray-200 rounded-full" />
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-3 w-full bg-gray-100 rounded" />)}
          </div>
        </div>
        <div className="card p-5 lg:col-span-2">
          <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
          <div className="grid grid-cols-3 gap-3">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="h-4 w-24 bg-gray-200 rounded" />
        </div>
        {[1,2,3].map(i => (
          <div key={i} className="flex items-center gap-3 px-5 py-4 border-b border-gray-50">
            <div className="w-9 h-9 bg-gray-200 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-36 bg-gray-200 rounded" />
              <div className="h-3 w-24 bg-gray-100 rounded" />
            </div>
            <div className="h-5 w-16 bg-gray-100 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
