'use client'

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

interface DraftRestoreDialogProps {
  open: boolean
  onRestore: () => void
  onDiscard: () => void
  entityType: string // 'company' or 'customer'
}

export function DraftRestoreDialog({ open, onRestore, onDiscard, entityType }: DraftRestoreDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Restore Draft?</AlertDialogTitle>
          <AlertDialogDescription>
            We found an unsaved draft for this {entityType}. Would you like to restore it or start fresh?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onDiscard}>Start Fresh</AlertDialogCancel>
          <AlertDialogAction onClick={onRestore}>Restore Draft</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
