'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { FileText, MoreVertical, Pencil, Download, Trash2, History, Send } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useDeleteQuotation, quotationKeys } from '@/lib/hooks/useQuotations'
import { formatCurrency } from '@/lib/utils/quotation-calculations'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AuditLogTimeline } from '@/components/audit/AuditLogTimeline'

interface QuotationCardProps {
  quotation: {
    id: string
    number: string
    date: Date | string
    customerName: string
    financialYear: string
    total: number | string
    status: 'DRAFT' | 'SENT' | 'PAID' | 'UNPAID'
    company: {
      id: string
      name: string
      gstin: string
    }
  }
}

const statusConfig = {
  DRAFT: { label: 'Draft', className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' },
  SENT: { label: 'Sent', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
  PAID: { label: 'Paid', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
  UNPAID: { label: 'Unpaid', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
}

export function QuotationCard({ quotation }: QuotationCardProps) {
  const tCommon = useTranslations('common')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showHistoryDialog, setShowHistoryDialog] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const deleteMutation = useDeleteQuotation()
  const queryClient = useQueryClient()
  const statusInfo = statusConfig[quotation.status]

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(quotation.id)
      const { toast } = await import('sonner')
      toast.success('Quotation deleted successfully')
      setShowDeleteDialog(false)
    } catch {
      const { toast } = await import('sonner')
      toast.error('Failed to delete quotation')
    }
  }

  const handleMarkAsSent = async () => {
    setIsUpdatingStatus(true)
    try {
      const response = await fetch(`/api/quotations/${quotation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'SENT' }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update status')
      }

      // Invalidate cache to refresh the list
      queryClient.invalidateQueries({ queryKey: quotationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: quotationKeys.detail(quotation.id) })

      const { toast } = await import('sonner')
      toast.success('Quotation marked as sent!')
    } catch (error) {
      const { toast } = await import('sonner')
      toast.error(error instanceof Error ? error.message : 'Failed to mark as sent')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleDownloadPDF = async () => {
    setIsDownloading(true)
    try {
      const response = await fetch(`/api/quotations/pdf?id=${quotation.id}`)

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Quotation-${quotation.number}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      const { toast } = await import('sonner')
      toast.success('PDF downloaded successfully')
    } catch {
      const { toast } = await import('sonner')
      toast.error('Failed to download PDF')
    } finally {
      setIsDownloading(false)
    }
  }

  const formattedDate = typeof quotation.date === 'string'
    ? format(new Date(quotation.date), 'dd MMM yyyy')
    : format(quotation.date, 'dd MMM yyyy')

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            {/* Quotation Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950">
                  <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{quotation.number}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{formattedDate}</p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-1.5 mt-3">
                <div className="text-sm">
                  <span className="text-muted-foreground">Customer: </span>
                  <span className="font-medium">{quotation.customerName}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Company: </span>
                  <span className="font-medium truncate">{quotation.company.name}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">F.Y.: </span>
                  <span className="font-medium">{quotation.financialYear}</span>
                </div>
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-2">
                  {formatCurrency(Number(quotation.total))}
                </div>
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
                  <Link href={`/dashboard/quotations/${quotation.id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    {tCommon('edit')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadPDF} disabled={isDownloading}>
                  <Download className="mr-2 h-4 w-4" />
                  {isDownloading ? 'Downloading...' : 'Download PDF'}
                </DropdownMenuItem>
                {quotation.status === 'DRAFT' && (
                  <DropdownMenuItem onClick={handleMarkAsSent} disabled={isUpdatingStatus}>
                    <Send className="mr-2 h-4 w-4" />
                    {isUpdatingStatus ? 'Updating...' : 'Mark as Sent'}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setShowHistoryDialog(true)}>
                  <History className="mr-2 h-4 w-4" />
                  View History
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 dark:text-red-400"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quotation?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete quotation <strong>{quotation.number}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Audit History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Audit History - {quotation.number}</DialogTitle>
          </DialogHeader>
          <AuditLogTimeline entity="quotation" entityId={quotation.id} />
        </DialogContent>
      </Dialog>
    </>
  )
}
