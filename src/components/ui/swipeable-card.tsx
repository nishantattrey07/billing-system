'use client'

import { useState, useRef } from 'react'
import { motion, PanInfo } from 'framer-motion'
import { Pencil, Eye } from 'lucide-react'
import { useHaptic } from '@/lib/hooks/useHaptic'
import { cn } from '@/lib/utils'

interface SwipeAction {
  icon: React.ReactNode
  label: string
  color: string
  onClick: () => void
}

interface SwipeableCardProps {
  children: React.ReactNode
  onEdit?: () => void
  onView?: () => void
  className?: string
}

export function SwipeableCard({ children, onEdit, onView, className }: SwipeableCardProps) {
  const [swipeOffset, setSwipeOffset] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const { vibrate } = useHaptic()

  const actions: SwipeAction[] = [
    ...(onEdit ? [{
      icon: <Pencil className="h-4 w-4" />,
      label: 'Edit',
      color: 'bg-blue-500',
      onClick: onEdit,
    }] : []),
    ...(onView ? [{
      icon: <Eye className="h-4 w-4" />,
      label: 'View',
      color: 'bg-gray-500',
      onClick: onView,
    }] : []),
  ]

  const actionWidth = 80
  const threshold = actionWidth * actions.length

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeDistance = info.offset.x

    if (swipeDistance < -threshold / 2) {
      // Swipe left to reveal actions
      setSwipeOffset(-threshold)
      vibrate('light')
    } else {
      // Reset
      setSwipeOffset(0)
    }
  }

  const handleActionClick = (action: SwipeAction) => {
    vibrate('medium')
    action.onClick()
    setSwipeOffset(0)
  }

  return (
    <div ref={containerRef} className={cn('relative overflow-hidden', className)}>
      {/* Swipe Actions */}
      <div className="absolute right-0 top-0 bottom-0 flex">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleActionClick(action)}
            className={cn(
              'flex flex-col items-center justify-center text-white transition-opacity',
              action.color
            )}
            style={{
              width: actionWidth,
              opacity: swipeOffset < 0 ? 1 : 0,
            }}
          >
            {action.icon}
            <span className="text-xs mt-1">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Card Content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -threshold, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={{ x: swipeOffset }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative z-10 bg-background"
      >
        {children}
      </motion.div>
    </div>
  )
}
