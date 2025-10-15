import { Card, CardContent } from '@/components/ui/card'

export function QuotationListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                {/* Icon and header */}
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                    <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2">
                  <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                  <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                  <div className="h-5 w-20 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mt-3" />
                </div>
              </div>

              {/* Menu button */}
              <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
