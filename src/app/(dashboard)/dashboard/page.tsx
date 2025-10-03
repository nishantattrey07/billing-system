'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Receipt, Package, Building2, Users, Plus } from 'lucide-react'

export default function DashboardPage() {
  const t = useTranslations('dashboard')
  const tCommon = useTranslations('common')
  const tStats = useTranslations('stats')
  const tCompany = useTranslations('company')
  const tCustomer = useTranslations('customer')

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">{t('welcome')}</p>
      </div>

      {/* Quick Actions - Mobile First */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
              <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{tCompany('register')}</h3>
              <p className="text-sm text-muted-foreground">{tCompany('addNew')}</p>
            </div>
            <Plus className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
              <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{tCustomer('register')}</h3>
              <p className="text-sm text-muted-foreground">{tCustomer('addNew')}</p>
            </div>
            <Plus className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Quotations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {tStats('quotations')}
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              {tCommon('noData')}
            </p>
            <Button size="sm" className="mt-4 w-full">
              <Plus className="h-4 w-4 mr-2" />
              {tCommon('add')}
            </Button>
          </CardContent>
        </Card>

        {/* Invoices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {tStats('invoices')}
            </CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              {tCommon('noData')}
            </p>
            <Button size="sm" className="mt-4 w-full">
              <Plus className="h-4 w-4 mr-2" />
              {tCommon('add')}
            </Button>
          </CardContent>
        </Card>

        {/* Challans */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {tStats('challans')}
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              {tCommon('noData')}
            </p>
            <Button size="sm" className="mt-4 w-full">
              <Plus className="h-4 w-4 mr-2" />
              {tCommon('add')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>{t('recentActivity')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            {tCommon('noData')}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
