import { z } from 'zod'
import { GSTIN_REGEX, PAN_REGEX, PHONE_REGEX, PINCODE_REGEX } from '../indian-validators'

export const customerSchema = z.object({
  name: z.string().min(2).max(100),
  gstin: z.string().length(15).regex(GSTIN_REGEX, 'Invalid GSTIN format').optional().or(z.literal('')),
  pan: z.string().length(10).regex(PAN_REGEX, 'Invalid PAN format').optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  state: z.string().max(100).optional().or(z.literal('')),
  pincode: z.string().regex(PINCODE_REGEX, 'Invalid pincode').optional().or(z.literal('')),
  phone: z.string().regex(PHONE_REGEX, 'Invalid phone number').optional().or(z.literal('')),
  email: z.email('Invalid email').optional().or(z.literal('')),
  contactPerson: z.string().max(100).optional().or(z.literal('')),
})

export const updateCustomerSchema = customerSchema.partial().extend({
  id: z.string().uuid(),
})

export type CustomerInput = z.infer<typeof customerSchema>
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>
