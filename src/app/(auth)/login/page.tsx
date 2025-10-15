import { LoginForm } from '@/components/auth/LoginForm'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">
          Sign in to your billing system account
        </p>
      </div>

      <LoginForm />

      <div className="space-y-2 text-center text-sm">
        <p className="text-muted-foreground">
          <Link
            href="/forgot-password"
            className="font-medium text-primary hover:underline"
          >
            Forgot your password?
          </Link>
        </p>
      </div>
    </div>
  )
}
