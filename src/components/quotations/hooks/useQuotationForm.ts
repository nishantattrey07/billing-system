import { useState, useEffect } from 'react'
import {
  calculateItemAmount,
  calculateSubtotal,
  calculateGST,
  calculateTotal,
  numberToWords,
} from '@/lib/utils/quotation-calculations'
import { getCurrentFinancialYear } from '@/lib/utils/quotation-number'
import { useStore } from '@/lib/store/useStore'

// Props interface for initial data from server
interface UseQuotationFormProps {
  initialCompany?: {
    id: string
    name: string
    gstin: string
    address: string | null
    phone: string | null
    state: string | null
    defaultTerms: string | null
  } | null
  initialCustomers?: Array<{
    id: string
    name: string
    gstin?: string | null
    address?: string | null
    city?: string | null
    state?: string | null
  }>
}

export interface QuotationItem {
  id: string
  name: string
  remarks?: string
  quantity: number
  unit: string
  unitPrice: number
  discount: number
  amount: number
  sortOrder: number
}

export interface QuotationFormState {
  // Quotation Details
  number: string
  date: Date
  subject: string
  validUntil?: Date
  financialYear: string

  // Company
  companyId: string
  companyName: string
  companyGstin: string
  companyAddress: string
  companyPhone: string
  companyState: string

  // Customer
  customerId: string
  customerName: string
  customerGstin?: string
  customerAddress?: string
  customerCity?: string
  customerState?: string

  // Items
  items: QuotationItem[]

  // Calculations
  freightCharges: number

  // Computed
  subtotal: number
  sgst: number
  cgst: number
  igst: number
  total: number
  totalInWords: string

  // Terms
  terms: string

  // Safety Checks
  safetyChecks: {
    quotationDetails: boolean
    customerInfo: boolean
    items: boolean
    calculations: boolean
    terms: boolean
  }

  // Meta
  isDraft: boolean
  lastSaved?: Date
}

export function useQuotationForm(props?: UseQuotationFormProps) {
  const selectedCompany = useStore((state) => state.selectedCompany)

  // Use server-provided company if available, otherwise fall back to Zustand
  const company = props?.initialCompany || selectedCompany

  const [formState, setFormState] = useState<QuotationFormState>({
    // Initialize with defaults
    number: 'Q.no: ',
    date: new Date(),
    subject: '',
    financialYear: getCurrentFinancialYear(),

    // Company (from server props or Zustand store)
    companyId: company?.id || '',
    companyName: company?.name || '',
    companyGstin: company?.gstin || '',
    companyAddress: company?.address || '',
    companyPhone: company?.phone || '',
    companyState: company?.state || '',

    // Customer
    customerId: '',
    customerName: '',
    customerState: '',

    // Items
    items: [],

    // Calculations
    freightCharges: 0,
    subtotal: 0,
    sgst: 0,
    cgst: 0,
    igst: 0,
    total: 0,
    totalInWords: '',

    // Terms - use company default terms if available
    terms: company?.defaultTerms || '',

    // Safety Checks
    safetyChecks: {
      quotationDetails: false,
      customerInfo: false,
      items: false,
      calculations: false,
      terms: false,
    },

    // Meta
    isDraft: true,
  })

  // Watch for company changes in Zustand store and update form
  useEffect(() => {
    if (selectedCompany && selectedCompany.id !== formState.companyId) {
      setFormState((prev) => ({
        ...prev,
        companyId: selectedCompany.id,
        companyName: selectedCompany.name,
        companyGstin: selectedCompany.gstin,
        companyAddress: selectedCompany.address || '',
        companyPhone: selectedCompany.phone || '',
        companyState: selectedCompany.state || '',
        terms: selectedCompany.defaultTerms || prev.terms,
      }))
    }
  }, [selectedCompany, formState.companyId])

  // Recalculate amounts whenever items or freight changes
  useEffect(() => {
    const itemsWithAmounts = formState.items.map((item) => {
      // Only calculate if values are valid, otherwise set amount to 0
      if (item.quantity > 0 && item.unitPrice >= 0) {
        try {
          return {
            ...item,
            amount: calculateItemAmount(item.quantity, item.unitPrice, item.discount),
          }
        } catch {
          return { ...item, amount: 0 }
        }
      }
      return { ...item, amount: 0 }
    })

    const subtotal = calculateSubtotal(itemsWithAmounts)

    const gst = calculateGST(
      subtotal + formState.freightCharges,
      formState.companyState || '',
      formState.customerState || ''
    )

    const total = calculateTotal(subtotal, formState.freightCharges, gst)
    const totalInWords = numberToWords(total)

    setFormState((prev) => ({
      ...prev,
      items: itemsWithAmounts,
      subtotal,
      sgst: gst.sgst,
      cgst: gst.cgst,
      igst: gst.igst,
      total,
      totalInWords,
    }))
  }, [
    formState.items.length,
    formState.items.map(i => `${i.quantity}-${i.unitPrice}-${i.discount}`).join(','),
    formState.freightCharges,
    formState.companyState,
    formState.customerState,
  ])

  // Update functions
  const updateField = <K extends keyof QuotationFormState>(
    field: K,
    value: QuotationFormState[K]
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  const addItem = () => {
    const newItem: QuotationItem = {
      id: `item-${Date.now()}`,
      name: '',
      remarks: '',
      quantity: 1,
      unit: 'NOS',
      unitPrice: 0,
      discount: 0,
      amount: 0,
      sortOrder: formState.items.length,
    }

    setFormState((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }))
  }

  const updateItem = (id: string, updates: Partial<QuotationItem>) => {
    setFormState((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }))
  }

  const removeItem = (id: string) => {
    setFormState((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }))
  }

  const toggleSafetyCheck = (check: keyof QuotationFormState['safetyChecks']) => {
    setFormState((prev) => ({
      ...prev,
      safetyChecks: {
        ...prev.safetyChecks,
        [check]: !prev.safetyChecks[check],
      },
    }))
  }

  return {
    ...formState,
    updateField,
    addItem,
    updateItem,
    removeItem,
    toggleSafetyCheck,
  }
}
