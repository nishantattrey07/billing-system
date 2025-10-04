import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Company } from '@/generated/prisma'

type Language = 'en' | 'hi'

interface AppState {
  // Selected company
  selectedCompanyId: string | null
  selectedCompany: Company | null
  setSelectedCompanyId: (id: string | null) => void
  setSelectedCompany: (company: Company | null) => void

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
      selectedCompany: null,
      setSelectedCompanyId: (id) => set({ selectedCompanyId: id }),
      setSelectedCompany: (company) => set({
        selectedCompany: company,
        selectedCompanyId: company?.id || null
      }),

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
