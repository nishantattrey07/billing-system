"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { Bell, Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { CompanySelector } from "./CompanySelector";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface HeaderProps {
  user: {
    email?: string;
  };
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export function Header({ user, onMenuClick, showMenuButton }: HeaderProps) {
  const t = useTranslations("common");
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const initials = user.email?.split("@")[0].slice(0, 2).toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4">
      {showMenuButton && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* Company Selector - Full on Desktop, Compact on Mobile */}
      <div className="hidden md:block">
        <CompanySelector />
      </div>
      <div className="block md:hidden">
        <CompanySelector compact />
      </div>

      <div className="flex-1" />

      <LanguageSwitcher />

      <Button variant="ghost" size="icon">
        <Bell className="h-5 w-5" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">Account</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            {t("signOut")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
