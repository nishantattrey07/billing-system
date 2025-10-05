import { Skeleton } from '@/components/ui/skeleton'

export function QuotationCreationSkeleton() {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Bar Skeleton */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Form Skeleton */}
        <div className="w-[40%] bg-white border-r border-gray-200 p-6 space-y-6">
          {/* Section 1 */}
          <div className="space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>

          {/* Section 3 */}
          <div className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-32 w-full" />
          </div>

          {/* Section 4 */}
          <div className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>

        {/* Right Panel - Preview Skeleton */}
        <div className="w-[60%] bg-gray-50 p-8">
          <div className="flex flex-col items-center gap-4 mb-4">
            <Skeleton className="h-10 w-full max-w-md rounded-lg" />
          </div>
          <div className="bg-white shadow-lg rounded-lg p-12 max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8 space-y-2">
              <Skeleton className="h-10 w-64 mx-auto" />
              <Skeleton className="h-1 w-24 mx-auto" />
            </div>

            {/* Title */}
            <Skeleton className="h-8 w-48 mx-auto mb-8" />

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>

            {/* Table */}
            <div className="space-y-2 mb-8">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>

            {/* Calculations */}
            <div className="flex justify-end mb-8">
              <div className="w-80 space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>

            {/* Terms */}
            <Skeleton className="h-32 w-full mb-8" />

            {/* Footer */}
            <div className="flex justify-between items-end pt-8">
              <Skeleton className="h-12 w-40" />
              <Skeleton className="h-12 w-48" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar Skeleton */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </div>
    </div>
  )
}
