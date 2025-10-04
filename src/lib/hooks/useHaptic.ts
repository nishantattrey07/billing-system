import { useCallback } from 'react'

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'

export function useHaptic() {
  const vibrate = useCallback((pattern: HapticPattern) => {
    // Check if vibration API is supported
    if (typeof navigator === 'undefined' || !navigator.vibrate) {
      return
    }

    // Define vibration patterns (in milliseconds)
    const patterns: Record<HapticPattern, number | number[]> = {
      light: 10,
      medium: 20,
      heavy: 30,
      success: [10, 50, 10], // Two short pulses
      warning: [20, 100, 20, 100, 20], // Three medium pulses
      error: [50, 100, 50], // Two heavy pulses
    }

    navigator.vibrate(patterns[pattern])
  }, [])

  return { vibrate }
}
