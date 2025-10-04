import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Language = 'en' | 'hi'

interface AppState {
  // Selected company
  selectedCompanyId: string | null
  setSelectedCompanyId: (id: string | null) => void

  // Language
  language: Language
  setLanguage: (lang: Language) => void

  // UI preferences
  sidebarCollapsed: boolean
  toggleSidebar: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Company state
      selectedCompanyId: null,
      setSelectedCompanyId: (id) => set({ selectedCompanyId: id }),

      // Language state
      language: 'en',
      setLanguage: (lang) => set({ language: lang }),

      // UI state
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: 'billing-system-storage',
    }
  )
)
