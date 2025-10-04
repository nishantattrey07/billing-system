import { useEffect, useRef, useState } from 'react'

interface UseAutoSaveOptions {
  key: string
  data: unknown
  interval?: number // in milliseconds, default 30s
  enabled?: boolean
}

export function useAutoSave({ key, data, interval = 30000, enabled = true }: UseAutoSaveOptions) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const savedDataRef = useRef<string>('')

  useEffect(() => {
    if (!enabled) return

    const currentData = JSON.stringify(data)

    // Skip if data hasn't changed
    if (currentData === savedDataRef.current) return

    const timer = setInterval(() => {
      try {
        localStorage.setItem(key, currentData)
        savedDataRef.current = currentData
        setLastSaved(new Date())
      } catch (error) {
        console.error('Failed to auto-save draft:', error)
      }
    }, interval)

    return () => clearInterval(timer)
  }, [key, data, interval, enabled])

  const clearDraft = () => {
    try {
      localStorage.removeItem(key)
      savedDataRef.current = ''
      setLastSaved(null)
    } catch (error) {
      console.error('Failed to clear draft:', error)
    }
  }

  const getDraft = <T,>(): T | null => {
    try {
      const draft = localStorage.getItem(key)
      return draft ? JSON.parse(draft) : null
    } catch (error) {
      console.error('Failed to get draft:', error)
      return null
    }
  }

  return { lastSaved, clearDraft, getDraft }
}
