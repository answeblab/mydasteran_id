'use client';

/**
 * Reusable skeleton loading components with shimmer animation.
 * Variants: 'card', 'list-item', 'stat-card', 'loyalty-card'
 */

export function SkeletonCard() {
  return (
    <div className="gojek-card animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded-full w-32 mb-2" />
          <div className="h-3 bg-gray-100 rounded-full w-24" />
        </div>
        <div className="h-6 w-16 bg-gray-200 rounded-full" />
      </div>
      <div className="border-t border-gray-100 my-3" />
      <div className="flex items-center justify-between">
        <div>
          <div className="h-3 bg-gray-100 rounded-full w-20 mb-1.5" />
          <div className="h-5 bg-gray-200 rounded-full w-28" />
        </div>
        <div className="h-6 w-14 bg-gray-100 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonListItem() {
  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0 animate-pulse">
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded-full w-36 mb-2" />
        <div className="h-3 bg-gray-100 rounded-full w-24" />
      </div>
      <div className="h-4 bg-gray-200 rounded-full w-16" />
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="gojek-card animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gray-200 flex-shrink-0" />
        <div className="flex-1">
          <div className="h-3 bg-gray-100 rounded-full w-20 mb-2" />
          <div className="h-7 bg-gray-200 rounded-full w-12" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonLoyaltyCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gray-200 p-5 animate-pulse shadow-xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="h-3 bg-gray-300 rounded-full w-20 mb-2" />
          <div className="h-6 bg-gray-300 rounded-full w-24" />
        </div>
        <div>
          <div className="h-3 bg-gray-300 rounded-full w-12 mb-2" />
          <div className="h-6 bg-gray-300 rounded-full w-16" />
        </div>
      </div>
      <div className="h-16 bg-gray-300 rounded-xl" />
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header skeleton */}
      <div className="bg-gray-300 h-24 animate-pulse" />

      <div className="px-4 -mt-4 pb-6 space-y-4">
        {/* Loyalty card skeleton */}
        <SkeletonLoyaltyCard />

        {/* Stat cards skeleton */}
        <div>
          <div className="h-5 bg-gray-200 rounded-full w-24 mb-3 animate-pulse" />
          <div className="grid grid-cols-2 gap-3">
            <SkeletonStatCard />
            <SkeletonStatCard />
          </div>
        </div>

        {/* Chart skeleton */}
        <div className="gojek-card animate-pulse">
          <div className="h-4 bg-gray-200 rounded-full w-40 mb-4" />
          <div className="flex items-end gap-2 h-24">
            {[40, 65, 50, 80, 45, 70].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-gray-200 rounded-t-lg"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>

        {/* History skeleton */}
        <div className="gojek-card">
          <div className="h-5 bg-gray-200 rounded-full w-48 mb-4 animate-pulse" />
          {[1, 2, 3].map(i => <SkeletonListItem key={i} />)}
        </div>
      </div>
    </div>
  );
}
