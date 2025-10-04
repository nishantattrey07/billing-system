'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Receipt, Package, Building2, Users, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export default function DashboardPage() {
  const t = useTranslations('dashboard')
  const tCommon = useTranslations('common')
  const tStats = useTranslations('stats')
  const tCompany = useTranslations('company')
  const tCustomer = useTranslations('customer')
  const tQuotation = useTranslations('quotation')
  const tInvoice = useTranslations('invoice')
  const tChallan = useTranslations('challan')

  // TODO: Replace with actual data from API
  const stats = {
    quotations: 12,
    invoices: 15,
    challans: 8,
  }

  const quickActions = [
    {
      icon: FileText,
      title: tQuotation('new'),
      color: 'blue',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      textColor: 'text-blue-600 dark:text-blue-400',
      hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900',
    },
    {
      icon: Package,
      title: tChallan('new'),
      color: 'purple',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      textColor: 'text-purple-600 dark:text-purple-400',
      hoverColor: 'hover:bg-purple-100 dark:hover:bg-purple-900',
    },
    {
      icon: Receipt,
      title: tInvoice('new'),
      color: 'green',
      bgColor: 'bg-green-50 dark:bg-green-950',
      textColor: 'text-green-600 dark:text-green-400',
      hoverColor: 'hover:bg-green-100 dark:hover:bg-green-900',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('welcome')}</p>
      </div>

      {/* Stats Overview - Minimal Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { count: stats.quotations, label: tStats('quotations'), color: 'text-blue-600 dark:text-blue-400' },
          { count: stats.challans, label: tStats('challans'), color: 'text-purple-600 dark:text-purple-400' },
          { count: stats.invoices, label: tStats('invoices'), color: 'text-green-600 dark:text-green-400' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-border/40 shadow-sm">
              <CardContent className="pt-5 pb-4 text-center">
                <div className={`text-2xl font-semibold ${stat.color}`}>
                  {stat.count}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions - Premium Minimal Design */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">{t('quickActions')}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="border-border/40 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg ${action.bgColor} ${action.hoverColor} transition-colors`}>
                        <action.icon className={`h-5 w-5 ${action.textColor}`} strokeWidth={2} />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{action.title}</h3>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Setup Actions - Compact List */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">{t('setupManagement')}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              icon: Building2,
              title: tCompany('register'),
              bgColor: 'bg-orange-50 dark:bg-orange-950',
              textColor: 'text-orange-600 dark:text-orange-400',
              hoverColor: 'hover:bg-orange-100 dark:hover:bg-orange-900',
            },
            {
              icon: Users,
              title: tCustomer('register'),
              bgColor: 'bg-teal-50 dark:bg-teal-950',
              textColor: 'text-teal-600 dark:text-teal-400',
              hoverColor: 'hover:bg-teal-100 dark:hover:bg-teal-900',
            },
          ].map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="border-border/40 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${action.bgColor} ${action.hoverColor} transition-colors`}>
                        <action.icon className={`h-4 w-4 ${action.textColor}`} strokeWidth={2} />
                      </div>
                      <h3 className="font-medium text-sm">{action.title}</h3>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="border-border/40 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">{t('recentActivity')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-sm text-muted-foreground">
            {tCommon('noData')}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
