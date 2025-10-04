'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface FormProgressProps {
  progress: number // 0-100
  className?: string
}

export function FormProgress({ progress, className }: FormProgressProps) {
  const circumference = 2 * Math.PI * 20 // radius = 20
  const offset = circumference - (progress / 100) * circumference

  const getColor = () => {
    if (progress < 30) return 'text-red-500'
    if (progress < 70) return 'text-yellow-500'
    return 'text-green-500'
  }

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg className="w-12 h-12 transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="24"
          cy="24"
          r="20"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          className="text-muted"
          opacity="0.2"
        />
        {/* Progress circle */}
        <motion.circle
          cx="24"
          cy="24"
          r="20"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          className={cn('transition-colors duration-300', getColor())}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          strokeDasharray={circumference}
        />
      </svg>
      {/* Percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn('text-xs font-semibold', getColor())}>
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  )
}
