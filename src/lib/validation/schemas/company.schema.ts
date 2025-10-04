import { z } from 'zod'
import { GSTIN_REGEX, PAN_REGEX, PHONE_REGEX, PINCODE_REGEX, IFSC_REGEX } from '../indian-validators'

export const companySchema = z.object({
  name: z.string().min(2).max(100),
  gstin: z.string().length(15).regex(GSTIN_REGEX, 'Invalid GSTIN format'),
  pan: z.string().length(10).regex(PAN_REGEX, 'Invalid PAN format').optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  state: z.string().max(100).optional().or(z.literal('')),
  pincode: z.string().regex(PINCODE_REGEX, 'Invalid pincode').optional().or(z.literal('')),
  phone: z.string().regex(PHONE_REGEX, 'Invalid phone number').optional().or(z.literal('')),
  email: z.email('Invalid email').optional().or(z.literal('')),
  bankName: z.string().max(100).optional().or(z.literal('')),
  accountNumber: z.string().max(50).optional().or(z.literal('')),
  ifscCode: z.string().regex(IFSC_REGEX, 'Invalid IFSC code').optional().or(z.literal('')),
  branch: z.string().max(100).optional().or(z.literal('')),
})

export const updateCompanySchema = companySchema.partial().extend({
  id: z.string().uuid(),
})

export type CompanyInput = z.infer<typeof companySchema>
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>
