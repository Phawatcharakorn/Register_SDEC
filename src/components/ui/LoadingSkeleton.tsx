function Bone({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
  )
}

export function ApplicantCardSkeleton() {
  return (
    <div className="section-card flex gap-4">
      <Bone className="h-16 w-16 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2 py-1">
        <Bone className="h-4 w-2/5" />
        <Bone className="h-3 w-1/3" />
        <Bone className="h-3 w-1/2" />
        <div className="flex gap-2 pt-1">
          <Bone className="h-5 w-20 rounded-full" />
          <Bone className="h-5 w-16 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <ApplicantCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="section-card flex gap-6">
        <Bone className="h-32 w-32 shrink-0 rounded-xl" />
        <div className="flex-1 space-y-3 py-1">
          <Bone className="h-6 w-1/3" />
          <Bone className="h-4 w-1/4" />
          <Bone className="h-4 w-2/5" />
          <Bone className="h-4 w-1/3" />
        </div>
      </div>
      <div className="section-card space-y-3">
        <Bone className="h-4 w-1/5" />
        <Bone className="h-20 w-full" />
      </div>
    </div>
  )
}
