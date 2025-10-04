import * as React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  formatGSTIN,
  unformatGSTIN,
  formatPAN,
  formatPincode,
  formatIFSC,
  extractStateFromGSTIN,
} from '@/lib/utils/input-masks'

export interface FormInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string
  error?: string
  mask?: 'gstin' | 'pan' | 'phone' | 'pincode' | 'ifsc'
  onChange?: (value: string) => void
  showStateHint?: boolean
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, label, error, mask, onChange, showStateHint, value, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState('')
    const [detectedState, setDetectedState] = React.useState('')

    React.useEffect(() => {
      if (value !== undefined) {
        setDisplayValue(formatValue(String(value), mask))
      }
    }, [value, mask])

    const formatValue = (val: string, maskType?: FormInputProps['mask']): string => {
      if (!maskType) return val

      switch (maskType) {
        case 'gstin':
          return formatGSTIN(val)
        case 'pan':
          return formatPAN(val)
        case 'pincode':
          return formatPincode(val)
        case 'ifsc':
          return formatIFSC(val)
        default:
          return val
      }
    }

    const unformatValue = (val: string, maskType?: FormInputProps['mask']): string => {
      if (!maskType) return val

      switch (maskType) {
        case 'gstin':
          return unformatGSTIN(val)
        default:
          return val
      }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      const formatted = formatValue(inputValue, mask)
      const unformatted = unformatValue(formatted, mask)

      setDisplayValue(formatted)

      // Detect state from GSTIN
      if (mask === 'gstin' && showStateHint && unformatted.length >= 2) {
        const state = extractStateFromGSTIN(unformatted)
        setDetectedState(state)
      } else {
        setDetectedState('')
      }

      onChange?.(unformatted)
    }

    return (
      <div className="space-y-1.5">
        {label && (
          <Label htmlFor={props.id} className={cn(error && 'text-destructive')}>
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        <Input
          ref={ref}
          value={displayValue}
          onChange={handleChange}
          className={cn(error && 'border-destructive', className)}
          {...props}
        />
        {detectedState && (
          <p className="text-xs text-muted-foreground">
            State detected: <span className="font-medium">{detectedState}</span>
          </p>
        )}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    )
  }
)

FormInput.displayName = 'FormInput'
