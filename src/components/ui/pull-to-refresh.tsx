'use client'

import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import { useHaptic } from '@/lib/hooks/useHaptic'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
  threshold?: number
}

export function PullToRefresh({ onRefresh, children, threshold = 80 }: PullToRefreshProps) {
  const [pulling, setPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startY = useRef(0)
  const { vibrate } = useHaptic()

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Only trigger if scrolled to top
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY
      setPulling(true)
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pulling || window.scrollY > 0) {
      setPulling(false)
      return
    }

    const currentY = e.touches[0].clientY
    const distance = currentY - startY.current

    if (distance > 0) {
      setPullDistance(Math.min(distance, threshold * 1.5))
    }
  }, [pulling, threshold])

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance > threshold) {
      vibrate('light')
      setRefreshing(true)
      try {
        await onRefresh()
        vibrate('success')
      } catch (error) {
        vibrate('error')
        console.error('Refresh failed:', error)
      } finally {
        setRefreshing(false)
      }
    }
    setPulling(false)
    setPullDistance(0)
  }, [pullDistance, threshold, onRefresh, vibrate])

  const pullProgress = Math.min(pullDistance / threshold, 1)

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-center"
        initial={{ opacity: 0, y: -50 }}
        animate={{
          opacity: pulling || refreshing ? 1 : 0,
          y: pulling || refreshing ? pullDistance * 0.5 : -50,
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="bg-background/80 backdrop-blur-sm rounded-full p-2 shadow-lg">
          <motion.div
            animate={{
              rotate: refreshing ? 360 : pullProgress * 360,
            }}
            transition={{
              duration: refreshing ? 1 : 0,
              repeat: refreshing ? Infinity : 0,
              ease: 'linear',
            }}
          >
            <RefreshCw className="h-5 w-5 text-primary" />
          </motion.div>
        </div>
      </motion.div>

      {children}
    </div>
  )
}
