'use client'

import { Drawer } from 'vaul'
import { cn } from '@/lib/utils'

interface BottomSheetProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
  title?: string
  description?: string
  snapPoints?: (string | number)[]
  defaultSnapPoint?: string | number
}

export function BottomSheet({
  open,
  onOpenChange,
  children,
  title,
  description,
  snapPoints,
}: BottomSheetProps) {
  // Conditionally build props to avoid type conflicts
  const drawerProps = snapPoints
    ? {
        open,
        onOpenChange,
        snapPoints,
        fadeFromIndex: snapPoints.length - 1,
      }
    : {
        open,
        onOpenChange,
        modal: true,
      }

  return (
    <Drawer.Root {...drawerProps}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content
          className={cn(
            'fixed bottom-0 left-0 right-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background',
            snapPoints ? 'max-h-[96%]' : 'max-h-[92vh]'
          )}
        >
          {/* Handle */}
          <div className="mx-auto mt-4 h-1.5 w-12 flex-shrink-0 rounded-full bg-muted" />

          {/* Header */}
          {(title || description) && (
            <div className="flex-shrink-0 px-4 pt-4">
              {title && (
                <Drawer.Title className="text-lg font-semibold">
                  {title}
                </Drawer.Title>
              )}
              {description && (
                <Drawer.Description className="text-sm text-muted-foreground mt-1">
                  {description}
                </Drawer.Description>
              )}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

// Simple trigger component
export function BottomSheetTrigger({ children, ...props }: React.ComponentProps<typeof Drawer.Trigger>) {
  return <Drawer.Trigger {...props}>{children}</Drawer.Trigger>
}
