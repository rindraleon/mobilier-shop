import { forwardRef } from "react";
import type {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { ChevronDown } from "lucide-react";

interface FieldProps extends LabelHTMLAttributes<HTMLLabelElement> {
  label?: ReactNode;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

export function Field({ label, error, hint, required, children, className = "", ...props }: FieldProps) {
  return (
    <label className={`block ${className}`} {...props}>
      {label && (
        <span className="mb-1.5 block text-label-md text-on-surface-variant">
          {label} {required && <span className="text-red-600">*</span>}
        </span>
      )}
      {children}
      {hint && !error && <span className="mt-1 block text-label-sm text-on-surface-variant/80">{hint}</span>}
      {error && <span className="mt-1 block text-label-sm text-red-600">{error}</span>}
    </label>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = "", ...props }, ref) {
    return <input ref={ref} className={`input-field ${className}`} {...props} />;
  }
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className = "", rows = 5, ...props }, ref) {
    return <textarea ref={ref} rows={rows} className={`input-field resize-none ${className}`} {...props} />;
  }
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className = "", children, ...props }, ref) {
    return (
      <span className="relative block">
        <select ref={ref} className={`input-field appearance-none pr-10 ${className}`} {...props}>
          {children}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant"
        />
      </span>
    );
  }
);

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
}

export function Checkbox({ label, ...props }: CheckboxProps) {
  return (
    <label className="flex cursor-pointer select-none items-start gap-2.5">
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 rounded border-outline-variant text-secondary accent-secondary focus:ring-secondary/30"
        {...props}
      />
      <span className="text-body-sm text-on-surface-variant">{label}</span>
    </label>
  );
}
