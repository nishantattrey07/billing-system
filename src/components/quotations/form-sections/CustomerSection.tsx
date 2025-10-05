'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCustomers } from '@/lib/hooks/useCustomers'
import type { useQuotationForm } from '../hooks/useQuotationForm'

interface CustomerSectionProps {
  formState: ReturnType<typeof useQuotationForm>
  safetyMode: boolean
}

export function CustomerSection({ formState, safetyMode }: CustomerSectionProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { data: customersData, isLoading } = useCustomers(search)

  const customers = customersData?.pages.flatMap((page) => page.data) || []

  const handleSelectCustomer = (customer: {
    id: string
    name: string
    gstin?: string | null
    address?: string | null
    city?: string | null
    state?: string | null
  }) => {
    formState.updateField('customerId', customer.id)
    formState.updateField('customerName', customer.name)
    formState.updateField('customerGstin', customer.gstin || '')
    formState.updateField('customerAddress', customer.address || '')
    formState.updateField('customerCity', customer.city || '')
    formState.updateField('customerState', customer.state || '')
    setOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Customer Information</h2>
        {safetyMode && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="check-customer-info"
              checked={formState.safetyChecks.customerInfo}
              onCheckedChange={() => formState.toggleSafetyCheck('customerInfo')}
            />
            <Label
              htmlFor="check-customer-info"
              className="text-sm font-medium cursor-pointer"
            >
              Verified
            </Label>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Customer Dropdown */}
        <div className="col-span-2 space-y-2">
          <Label>Select Customer *</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                {formState.customerName || 'Select customer...'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[600px] p-0">
              <Command>
                <CommandInput
                  placeholder="Search customers..."
                  value={search}
                  onValueChange={setSearch}
                />
                <CommandList>
                  <CommandEmpty>
                    {isLoading ? 'Loading...' : 'No customers found.'}
                  </CommandEmpty>
                  <CommandGroup>
                    {customers.map((customer) => (
                      <CommandItem
                        key={customer.id}
                        value={customer.name}
                        onSelect={() => handleSelectCustomer(customer)}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            formState.customerId === customer.id ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">{customer.name}</span>
                          {customer.city && customer.state && (
                            <span className="text-xs text-gray-500">
                              {customer.city}, {customer.state}
                              {customer.gstin && ` • GSTIN: ${customer.gstin}`}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Customer Name (Editable) */}
        <div className="col-span-2 space-y-2">
          <Label htmlFor="customer-name">Customer Name *</Label>
          <Input
            id="customer-name"
            value={formState.customerName}
            onChange={(e) => formState.updateField('customerName', e.target.value)}
            placeholder="Or enter manually"
          />
        </div>

        {/* GSTIN */}
        <div className="space-y-2">
          <Label htmlFor="customer-gstin">GSTIN</Label>
          <Input
            id="customer-gstin"
            value={formState.customerGstin || ''}
            onChange={(e) => formState.updateField('customerGstin', e.target.value)}
            placeholder="22AAAAA0000A1Z5"
            maxLength={15}
          />
        </div>

        {/* State */}
        <div className="space-y-2">
          <Label htmlFor="customer-state">State *</Label>
          <Input
            id="customer-state"
            value={formState.customerState || ''}
            onChange={(e) => formState.updateField('customerState', e.target.value)}
            placeholder="e.g., Maharashtra"
          />
          <p className="text-xs text-gray-500">Required for GST calculation</p>
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label htmlFor="customer-city">City</Label>
          <Input
            id="customer-city"
            value={formState.customerCity || ''}
            onChange={(e) => formState.updateField('customerCity', e.target.value)}
            placeholder="Enter city"
          />
        </div>

        {/* Address */}
        <div className="col-span-2 space-y-2">
          <Label htmlFor="customer-address">Address</Label>
          <Textarea
            id="customer-address"
            value={formState.customerAddress || ''}
            onChange={(e) => formState.updateField('customerAddress', e.target.value)}
            placeholder="Enter complete address"
            rows={3}
          />
        </div>
      </div>
    </div>
  )
}
