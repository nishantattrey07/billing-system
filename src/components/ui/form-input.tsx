import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  extractStateFromGSTIN,
  formatGSTIN,
  formatIFSC,
  formatPAN,
  formatPincode,
  unformatGSTIN,
} from "@/lib/utils/input-masks";
import * as React from "react";

export interface FormInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  error?: string;
  mask?: "gstin" | "pan" | "phone" | "pincode" | "ifsc";
  onChange?: (value: string) => void;
  showStateHint?: boolean;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  (
    { className, label, error, mask, onChange, showStateHint, value, ...props },
    ref
  ) => {
    const [displayValue, setDisplayValue] = React.useState("");
    const [detectedState, setDetectedState] = React.useState("");
    const inputRef = React.useRef<HTMLInputElement>(null);
    const cursorPositionRef = React.useRef<number | null>(null);

    React.useEffect(() => {
      if (value !== undefined) {
        setDisplayValue(formatValue(String(value), mask));
      }
    }, [value, mask]);

    // Restore cursor position after value update
    React.useEffect(() => {
      if (inputRef.current && cursorPositionRef.current !== null) {
        inputRef.current.setSelectionRange(
          cursorPositionRef.current,
          cursorPositionRef.current
        );
        cursorPositionRef.current = null;
      }
    }, [displayValue]);

    const formatValue = (
      val: string,
      maskType?: FormInputProps["mask"]
    ): string => {
      if (!maskType) return val;

      switch (maskType) {
        case "gstin":
          return formatGSTIN(val);
        case "pan":
          return formatPAN(val);
        case "pincode":
          return formatPincode(val);
        case "ifsc":
          return formatIFSC(val);
        default:
          return val;
      }
    };

    const unformatValue = (
      val: string,
      maskType?: FormInputProps["mask"]
    ): string => {
      if (!maskType) return val;

      switch (maskType) {
        case "gstin":
          return unformatGSTIN(val);
        default:
          return val;
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const cursorPosition = e.target.selectionStart || 0;
      const previousValue = displayValue;

      const formatted = formatValue(inputValue, mask);
      const unformatted = unformatValue(formatted, mask);

      // Calculate new cursor position based on formatting changes
      let newCursorPosition = cursorPosition;

      // If characters were added (formatting), adjust cursor position
      const addedChars = formatted.length - previousValue.length;
      const inputChars = inputValue.length - previousValue.length;

      if (addedChars > inputChars) {
        // Formatting added characters (like dashes), move cursor past them
        newCursorPosition = cursorPosition + (addedChars - inputChars);
      } else if (addedChars < 0 && inputChars <= 0) {
        // Backspace/delete - keep cursor at deletion point
        newCursorPosition = cursorPosition;
      }

      cursorPositionRef.current = newCursorPosition;
      setDisplayValue(formatted);

      // Detect state from GSTIN
      if (mask === "gstin" && showStateHint && unformatted.length >= 2) {
        const state = extractStateFromGSTIN(unformatted);
        setDetectedState(state);
      } else {
        setDetectedState("");
      }

      onChange?.(unformatted);
    };

    return (
      <div className="space-y-2.5">
        {label && (
          <Label
            htmlFor={props.id}
            className={cn(
              "text-sm font-semibold text-foreground",
              error && "text-destructive"
            )}
          >
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        <Input
          ref={(node) => {
            inputRef.current = node;
            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          value={displayValue}
          onChange={handleChange}
          className={cn(error && "border-destructive", className)}
          {...props}
        />
        {detectedState && (
          <p className="text-xs text-muted-foreground font-medium mt-1.5">
            State detected:{" "}
            <span className="text-foreground font-semibold">
              {detectedState}
            </span>
          </p>
        )}
        {error && (
          <p className="text-xs text-destructive font-medium mt-1.5">{error}</p>
        )}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";
