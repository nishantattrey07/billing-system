import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'
import Link from 'next/link'

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Reset your password</h1>
        <p className="text-muted-foreground">
          Enter your new password below
        </p>
      </div>

      <ResetPasswordForm />

      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{' '}
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          Back to login
        </Link>
      </p>
    </div>
  )
}
