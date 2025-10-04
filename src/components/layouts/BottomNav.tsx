'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, FileText, Users, BarChart3, Settings } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: Home, label: 'home' },
  { href: '/dashboard/documents', icon: FileText, label: 'documents' },
  { href: '/dashboard/customers', icon: Users, label: 'customers' },
  { href: '/dashboard/reports', icon: BarChart3, label: 'reports' },
  { href: '/dashboard/settings', icon: Settings, label: 'settings' },
]

export function BottomNav() {
  const pathname = usePathname()
  const t = useTranslations('nav')

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 text-xs transition-colors',
                isActive
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px]">{t(item.label)}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
