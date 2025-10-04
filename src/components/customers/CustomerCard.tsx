'use client'

import { Customer } from '@/generated/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CopyButton } from '@/components/ui/copy-button'
import { Users, Mail, MapPin, MoreVertical, Pencil, Phone, User } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

interface CustomerCardProps {
  customer: Customer
}

export function CustomerCard({ customer }: CustomerCardProps) {
  const tCommon = useTranslations('common')

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          {/* Customer Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-950">
                <Users className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{customer.name}</h3>
                {customer.gstin ? (
                  <div className="flex items-center gap-1">
                    <p className="text-xs text-muted-foreground">GSTIN: {customer.gstin}</p>
                    <CopyButton value={customer.gstin} label="GSTIN" />
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">B2C Customer</p>
                )}
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-1.5 mt-3">
              {customer.contactPerson && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">{customer.contactPerson}</span>
                </div>
              )}
              {customer.city && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">
                    {customer.city}
                    {customer.state && `, ${customer.state}`}
                  </span>
                </div>
              )}
              {customer.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">{customer.email}</span>
                </div>
              )}
              {customer.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{customer.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/customers/${customer.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  {tCommon('edit')}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
