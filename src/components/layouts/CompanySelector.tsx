"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAllCompanies } from "@/lib/hooks/useCompanies";
import { useStore } from "@/lib/store/useStore";
import { cn } from "@/lib/utils";
import { Building2, Check, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface CompanySelectorProps {
  compact?: boolean; // For mobile view
}

export function CompanySelector({ compact = false }: CompanySelectorProps) {
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");
  const { data: companies, isLoading, isError } = useAllCompanies();
  const { selectedCompanyId, selectedCompany, setSelectedCompany } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const hasInitialized = useRef(false);
  const queryClient = useQueryClient();

  // Debounce search term (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Auto-selection logic - only runs once on mount
  useEffect(() => {
    if (!companies || companies.length === 0 || hasInitialized.current) return;
    hasInitialized.current = true;

    // If no company selected from persisted state, select the first one
    if (!selectedCompanyId) {
      setSelectedCompany(companies[0]);
      return;
    }

    // Verify selected company still exists
    const companyExists = companies.find((c) => c.id === selectedCompanyId);
    if (!companyExists) {
      // Selected company no longer exists, select first available
      setSelectedCompany(companies[0]);
    } else if (!selectedCompany || selectedCompany.id !== selectedCompanyId) {
      // Update full company object if only ID is persisted
      setSelectedCompany(companyExists);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companies]);

  const currentCompany = selectedCompany || companies?.find((c) => c.id === selectedCompanyId);

  // Filter companies based on debounced search term
  const filteredCompanies = companies?.filter(
    (company) =>
      company.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      company.gstin.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  // Handle company selection
  const handleCompanySelect = (company: typeof companies[0]) => {
    setSelectedCompany(company);
    setSearchTerm("");
    toast.success(`Switched to ${company.name}`);
    // Invalidate stats to force fresh fetch
    queryClient.invalidateQueries({ queryKey: ['stats'] });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className={cn("h-10", compact ? "w-10" : "w-[250px]")} />
      </div>
    );
  }

  // Error state
  if (isError) {
    return <div className="text-sm text-destructive">{tCommon("noData")}</div>;
  }

  // Empty state - no companies registered
  if (!companies || companies.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size={compact ? "icon" : "default"} asChild>
          <Link href="/companies/new">
            <Building2 className="h-4 w-4" />
            {!compact && <span className="ml-2">{t("selectCompany")}</span>}
          </Link>
        </Button>
      </div>
    );
  }

  // Compact view for mobile
  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10"
            aria-label={t("selectCompany")}
          >
            {currentCompany ? (
              <span className="text-sm font-semibold">
                {currentCompany.name.charAt(0).toUpperCase()}
              </span>
            ) : (
              <Building2 className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[300px]">
          <DropdownMenuLabel>{t("selectCompany")}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="px-2 py-1">
            <Input
              placeholder={tCommon("search")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8"
            />
          </div>
          <DropdownMenuSeparator />
          <div className="max-h-[300px] overflow-y-auto">
            {filteredCompanies && filteredCompanies.length > 0 ? (
              filteredCompanies.map((company) => (
                <DropdownMenuItem
                  key={company.id}
                  onClick={() => handleCompanySelect(company)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedCompanyId === company.id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{company.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {company.gstin}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                {tCommon("noData")}
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Full view for desktop
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[250px] justify-between">
          {currentCompany ? (
            <div className="flex items-center gap-2 truncate">
              <Building2 className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{currentCompany.name}</span>
            </div>
          ) : (
            <span>{t("selectCompany")}</span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[300px]">
        <DropdownMenuLabel>{t("selectCompany")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 py-1">
          <Input
            placeholder={tCommon("search")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8"
          />
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-y-auto">
          {filteredCompanies && filteredCompanies.length > 0 ? (
            filteredCompanies.map((company) => (
              <DropdownMenuItem
                key={company.id}
                onClick={() => handleCompanySelect(company)}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedCompanyId === company.id
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                <div className="flex flex-col">
                  <span className="font-medium">{company.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {company.gstin}
                  </span>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              {tCommon("noData")}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
