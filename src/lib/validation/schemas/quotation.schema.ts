import { z } from 'zod'
import { GSTIN_REGEX } from '../indian-validators'

// Quotation Item Schema
export const quotationItemSchema = z.object({
  name: z.string().min(1, 'Item name is required').max(200, 'Item name too long'),
  remarks: z.string().max(1000, 'Remarks too long').optional().or(z.literal('')),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unit: z.string().min(1).max(20).default('NOS'),
  unitPrice: z.number().positive('Unit price must be greater than 0'),
  discount: z.number().min(0, 'Discount cannot be negative').max(100, 'Discount cannot exceed 100%').optional().default(0),
  sortOrder: z.number().int().min(0).default(0),
})

// For creating quotation items (client sends this)
export const createQuotationItemSchema = quotationItemSchema.omit({ sortOrder: true })

// Quotation Schema
export const quotationSchema = z.object({
  number: z.string().min(1, 'Quotation number is required').max(50),
  date: z.coerce.date(),
  subject: z.string().min(1, 'Subject is required').max(500, 'Subject too long'),

  companyId: z.string().uuid('Invalid company ID'),
  customerId: z.string().uuid('Invalid customer ID'),

  // Customer snapshot fields
  customerName: z.string().min(1, 'Customer name is required').max(200),
  customerGstin: z.string().regex(GSTIN_REGEX, 'Invalid GSTIN format').optional().or(z.literal('')),
  customerAddress: z.string().max(500).optional().or(z.literal('')),
  customerCity: z.string().max(100).optional().or(z.literal('')),
  customerState: z.string().max(100).optional().or(z.literal('')),

  financialYear: z.string().regex(/^\d{4}-\d{2}$/, 'Invalid financial year format (e.g., 2024-25)'),

  // Items array
  items: z.array(createQuotationItemSchema).min(1, 'At least one item is required'),

  // Financial fields
  freightCharges: z.number().min(0, 'Freight charges cannot be negative').default(0),

  // Optional fields
  terms: z.string().max(5000).optional().or(z.literal('')),
  validUntil: z.coerce.date().optional(),

  // Status
  status: z.enum(['DRAFT', 'SENT', 'PAID', 'UNPAID']).optional(),

  // Metadata
  isPopulatedByAI: z.boolean().default(false),
})

// For updating quotation
export const updateQuotationSchema = quotationSchema.partial().extend({
  id: z.string().uuid(),
})

// Safety check schema
export const safetyCheckSchema = z.object({
  quotationNumberVerified: z.boolean(),
  dateVerified: z.boolean(),
  customerVerified: z.boolean(),
  subjectVerified: z.boolean(),
  itemsVerified: z.boolean(),
  calculationsVerified: z.boolean(),
  termsVerified: z.boolean(),
  allFieldsComplete: z.boolean(),
}).refine(data =>
  Object.values(data).every(val => val === true),
  { message: 'All safety checks must be verified' }
)

// TypeScript types
export type QuotationItemInput = z.infer<typeof quotationItemSchema>
export type CreateQuotationItemInput = z.infer<typeof createQuotationItemSchema>
export type QuotationInput = z.infer<typeof quotationSchema>
export type UpdateQuotationInput = z.infer<typeof updateQuotationSchema>
export type SafetyCheckInput = z.infer<typeof safetyCheckSchema>
