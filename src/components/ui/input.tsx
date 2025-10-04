import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground/60 placeholder:italic selection:bg-primary selection:text-primary-foreground",
        "h-11 w-full min-w-0 rounded-lg border border-border/50 bg-background px-4 py-2.5 text-sm font-normal",
        "shadow-sm transition-all duration-200 outline-none",
        "hover:border-border hover:shadow-md",
        "focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 focus-visible:shadow-md",
        "aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/10",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "dark:bg-background/50 dark:border-border/30 dark:hover:border-border/60",
        className
      )}
      {...props}
    />
  )
}

export { Input }
