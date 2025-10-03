'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Home,
  FileText,
  Users,
  BarChart3,
  Settings,
  Building2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { useStore } from '@/lib/store/useStore'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/dashboard', icon: Home, label: 'home', section: 'main' },
  {
    href: '/dashboard/quotations',
    icon: FileText,
    label: 'quotations',
    section: 'documents'
  },
  {
    href: '/dashboard/invoices',
    icon: FileText,
    label: 'invoices',
    section: 'documents'
  },
  {
    href: '/dashboard/challans',
    icon: FileText,
    label: 'challans',
    section: 'documents'
  },
  {
    href: '/dashboard/customers',
    icon: Users,
    label: 'customers',
    section: 'people'
  },
  {
    href: '/dashboard/companies',
    icon: Building2,
    label: 'companies',
    section: 'people'
  },
  {
    href: '/dashboard/reports',
    icon: BarChart3,
    label: 'reports',
    section: 'other'
  },
  {
    href: '/dashboard/settings',
    icon: Settings,
    label: 'settings',
    section: 'other'
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const t = useTranslations('nav')
  const { sidebarCollapsed, toggleSidebar } = useStore()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r bg-background transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo/Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!sidebarCollapsed && (
          <h2 className="text-lg font-bold">Billing System</h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn('ml-auto', sidebarCollapsed && 'mx-auto')}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                sidebarCollapsed && 'justify-center'
              )}
              title={sidebarCollapsed ? t(item.label) : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!sidebarCollapsed && <span>{t(item.label)}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
