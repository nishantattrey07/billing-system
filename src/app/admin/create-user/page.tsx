'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  generatePassword: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

interface CreatedUser {
  email: string
  password: string
  message: string
}

export default function CreateUserPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [createdUser, setCreatedUser] = useState<CreatedUser | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      generatePassword: true,
    },
  })

  // Check if user is admin on mount
  useEffect(() => {
    async function checkAdminStatus() {
      try {
        const response = await fetch('/api/admin/create-user')
        const data = await response.json()

        if (data.success && data.isAdmin) {
          setIsAdmin(true)
        } else {
          setError('Access denied. Only admin can access this page.')
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_err) {
        setError('Failed to verify admin status')
      } finally {
        setIsCheckingAdmin(false)
      }
    }

    checkAdminStatus()
  }, [])

  async function onSubmit(values: FormValues) {
    setIsLoading(true)
    setError(null)
    setCreatedUser(null)

    try {
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to create user')
        return
      }

      // Show created credentials
      setCreatedUser(data.data.credentials)
      form.reset()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
  }

  // Loading state
  if (isCheckingAdmin) {
    return (
      <div className="container max-w-2xl mx-auto py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Verifying admin access...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Access denied
  if (!isAdmin) {
    return (
      <div className="container max-w-2xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {error || 'You do not have permission to access this page.'}
            </p>
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Admin UI
  return (
    <div className="container max-w-2xl mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin: Create User</h1>
        <p className="text-muted-foreground">
          Create a new user account for the billing system
        </p>
      </div>

      {createdUser && (
        <Card className="border-green-500 bg-green-500/5">
          <CardHeader>
            <CardTitle className="text-green-700 dark:text-green-400">
              User Created Successfully!
            </CardTitle>
            <CardDescription>
              Save these credentials securely. The password will not be shown again.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="flex gap-2">
                <Input value={createdUser.email} readOnly className="bg-muted" />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(createdUser.email)}
                >
                  Copy
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="flex gap-2">
                <Input
                  value={createdUser.password}
                  readOnly
                  className="bg-muted font-mono"
                  type="text"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(createdUser.password)}
                >
                  Copy
                </Button>
              </div>
            </div>

            <div className="rounded-md bg-yellow-500/10 border border-yellow-500/20 p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-400">
                ⚠️ Make sure to save this password securely. It cannot be retrieved later.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setCreatedUser(null)}
            >
              Create Another User
            </Button>
          </CardContent>
        </Card>
      )}

      {!createdUser && (
        <Card>
          <CardHeader>
            <CardTitle>User Details</CardTitle>
            <CardDescription>
              Enter the email address for the new user
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="user@example.com"
                          type="email"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The user will receive this email as their login credential
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="generatePassword"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Auto-generate Password</FormLabel>
                        <FormDescription>
                          Automatically create a secure random password
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? 'Creating User...' : 'Create User'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/dashboard')}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Admin Information</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• Only admin email (nishantattrey07@gmail.com) can create users</p>
          <p>• Users are automatically confirmed (no email verification required)</p>
          <p>• Generated passwords are 16 characters with mixed case, numbers, and symbols</p>
          <p>• Users can reset their password using the &quot;Forgot Password&quot; link</p>
        </CardContent>
      </Card>
    </div>
  )
}
