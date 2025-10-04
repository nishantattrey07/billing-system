import * as React from 'react'
import { Input } from '@/components/ui/input'
import { CopyButton } from '@/components/ui/copy-button'
import { cn } from '@/lib/utils'

interface InputWithCopyProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: string
  copyLabel?: string
}

export const InputWithCopy = React.forwardRef<HTMLInputElement, InputWithCopyProps>(
  ({ className, value, copyLabel, ...props }, ref) => {
    return (
      <div className="relative">
        <Input
          ref={ref}
          value={value}
          className={cn('pr-10', className)}
          {...props}
        />
        {value && (
          <div className="absolute right-1 top-1/2 -translate-y-1/2">
            <CopyButton value={value} label={copyLabel} size="sm" />
          </div>
        )}
      </div>
    )
  }
)

InputWithCopy.displayName = 'InputWithCopy'
