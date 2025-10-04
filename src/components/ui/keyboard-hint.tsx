'use client'

import { useIsMobile } from '@/lib/hooks/useMediaQuery'

export function KeyboardHint() {
  const isMobile = useIsMobile()

  // Don't render on mobile
  if (isMobile) return null

  return (
    <p className="text-xs text-muted-foreground">
      Tip: Press{' '}
      <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
        Cmd/Ctrl + S
      </kbd>{' '}
      to save,{' '}
      <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
        Esc
      </kbd>{' '}
      to cancel
    </p>
  )
}
