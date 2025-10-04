import { useEffect } from 'react'

interface SmartDefaults {
  city?: string
  state?: string
  pincode?: string
}

const SMART_DEFAULTS_KEY = 'billing-smart-defaults'

export function useSmartDefaults() {
  const getDefaults = (): SmartDefaults => {
    try {
      const stored = localStorage.getItem(SMART_DEFAULTS_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('Failed to get smart defaults:', error)
      return {}
    }
  }

  const saveDefaults = (data: Partial<SmartDefaults>) => {
    try {
      const current = getDefaults()
      const updated = { ...current, ...data }

      // Only save non-empty values
      const filtered = Object.fromEntries(
        Object.entries(updated).filter(([, value]) => value && value.trim() !== '')
      )

      localStorage.setItem(SMART_DEFAULTS_KEY, JSON.stringify(filtered))
    } catch (error) {
      console.error('Failed to save smart defaults:', error)
    }
  }

  const clearDefaults = () => {
    try {
      localStorage.removeItem(SMART_DEFAULTS_KEY)
    } catch (error) {
      console.error('Failed to clear smart defaults:', error)
    }
  }

  return { getDefaults, saveDefaults, clearDefaults }
}

// Hook to auto-save smart defaults when form values change
export function useAutoSaveDefaults(values: { city?: string; state?: string; pincode?: string }) {
  const { saveDefaults } = useSmartDefaults()

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (values.city || values.state || values.pincode) {
        saveDefaults(values)
      }
    }, 1000) // Debounce for 1 second

    return () => clearTimeout(timeout)
  }, [values, saveDefaults])
}
