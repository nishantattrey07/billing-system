"use client";

import { CompanySelector } from "@/components/layouts/CompanySelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useStats } from "@/lib/hooks/useStats";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  FileText,
  Package,
  Receipt,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");
  const tStats = useTranslations("stats");
  const tCompany = useTranslations("company");
  const tCustomer = useTranslations("customer");
  const tQuotation = useTranslations("quotation");
  const tInvoice = useTranslations("invoice");
  const tChallan = useTranslations("challan");

  // Fetch real stats data
  const { data: stats, isLoading } = useStats();

  const quickActions = [
    {
      icon: FileText,
      title: tQuotation("new"),
      color: "blue",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      textColor: "text-blue-600 dark:text-blue-400",
      hoverColor: "hover:bg-blue-100 dark:hover:bg-blue-900",
    },
    {
      icon: Package,
      title: tChallan("new"),
      color: "purple",
      bgColor: "bg-purple-50 dark:bg-purple-950",
      textColor: "text-purple-600 dark:text-purple-400",
      hoverColor: "hover:bg-purple-100 dark:hover:bg-purple-900",
    },
    {
      icon: Receipt,
      title: tInvoice("new"),
      color: "green",
      bgColor: "bg-green-50 dark:bg-green-950",
      textColor: "text-green-600 dark:text-green-400",
      hoverColor: "hover:bg-green-100 dark:hover:bg-green-900",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("welcome")}</p>
      </div>

      {/* Company Selector - Mobile Only */}
      <div className="md:hidden">
        <CompanySelector />
      </div>

      {/* Stats Overview - Responsive: Detailed on Desktop, Simple on Mobile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoading
          ? // Loading state
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="border-border/40 shadow-sm">
                <CardContent className="pt-5 pb-4">
                  <div className="md:hidden text-center">
                    {/* Mobile loading */}
                    <Skeleton className="h-8 w-12 mx-auto mb-2" />
                    <Skeleton className="h-4 w-20 mx-auto" />
                  </div>
                  <div className="hidden md:block">
                    {/* Desktop loading */}
                    <Skeleton className="h-5 w-24 mb-3" />
                    <Skeleton className="h-8 w-16 mb-4" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          : // Data loaded or error - show zeros if no data
            [
              {
                title: tStats("quotations"),
                total: stats?.quotations?.total ?? 0,
                icon: FileText,
                breakdown: [
                  {
                    label: tStats("draft"),
                    count: stats?.quotations?.draft ?? 0,
                  },
                  {
                    label: tStats("sent"),
                    count: stats?.quotations?.sent ?? 0,
                  },
                ],
                color: "text-blue-600 dark:text-blue-400",
                bgColor: "bg-blue-50 dark:bg-blue-950",
              },
              {
                title: tStats("challans"),
                total: stats?.challans?.total ?? 0,
                icon: Package,
                breakdown: [
                  {
                    label: tStats("draft"),
                    count: stats?.challans?.draft ?? 0,
                  },
                  { label: tStats("sent"), count: stats?.challans?.sent ?? 0 },
                ],
                color: "text-purple-600 dark:text-purple-400",
                bgColor: "bg-purple-50 dark:bg-purple-950",
              },
              {
                title: tStats("invoices"),
                total: stats?.invoices?.total ?? 0,
                icon: Receipt,
                breakdown: [
                  {
                    label: tStats("draft"),
                    count: stats?.invoices?.draft ?? 0,
                  },
                  { label: tStats("paid"), count: stats?.invoices?.paid ?? 0 },
                  {
                    label: tStats("unpaid"),
                    count: stats?.invoices?.unpaid ?? 0,
                  },
                ],
                color: "text-green-600 dark:text-green-400",
                bgColor: "bg-green-50 dark:bg-green-950",
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-border/40 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="pt-5 pb-4">
                    {/* Mobile View: Simple total only */}
                    <div className="md:hidden text-center">
                      <div className={`text-2xl font-semibold ${stat.color}`}>
                        {stat.total}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stat.title}
                      </p>
                    </div>

                    {/* Desktop View: Detailed breakdown with consistent height */}
                    <div className="hidden md:block h-32">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <stat.icon className={`h-4 w-4 ${stat.color}`} />
                          {stat.title}
                        </h3>
                      </div>
                      <div className={`text-3xl font-bold mb-4 ${stat.color}`}>
                        {stat.total}
                      </div>
                      <div className="grid grid-rows-3 gap-1.5 min-h-[4.5rem]">
                        {[0, 1, 2].map((idx) => {
                          const item = stat.breakdown[idx];
                          return (
                            <div key={idx} className="min-h-[1.25rem]">
                              {item && item.label ? (
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    {item.label}
                                  </span>
                                  <span className="font-medium">
                                    {item.count}
                                  </span>
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
      </div>

      {/* Quick Actions - Premium Minimal Design */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">
          {t("quickActions")}
        </h2>
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
                      <div
                        className={`p-2.5 rounded-lg ${action.bgColor} ${action.hoverColor} transition-colors`}
                      >
                        <action.icon
                          className={`h-5 w-5 ${action.textColor}`}
                          strokeWidth={2}
                        />
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
        <h2 className="text-sm font-medium text-muted-foreground mb-3">
          {t("setupManagement")}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              icon: Building2,
              title: tCompany("register"),
              href: "/companies/new",
              bgColor: "bg-orange-50 dark:bg-orange-950",
              textColor: "text-orange-600 dark:text-orange-400",
              hoverColor: "hover:bg-orange-100 dark:hover:bg-orange-900",
            },
            {
              icon: Users,
              title: tCustomer("register"),
              href: "/customers/new",
              bgColor: "bg-teal-50 dark:bg-teal-950",
              textColor: "text-teal-600 dark:text-teal-400",
              hoverColor: "hover:bg-teal-100 dark:hover:bg-teal-900",
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
              <Link href={action.href}>
                <Card className="border-border/40 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${action.bgColor} ${action.hoverColor} transition-colors`}
                        >
                          <action.icon
                            className={`h-4 w-4 ${action.textColor}`}
                            strokeWidth={2}
                          />
                        </div>
                        <h3 className="font-medium text-sm">{action.title}</h3>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="border-border/40 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">
            {t("recentActivity")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-sm text-muted-foreground">
            {tCommon("noData")}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
