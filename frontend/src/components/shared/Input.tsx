import { forwardRef, InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, ...props }, ref) => (
  <label className="block space-y-2">
    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
    <input ref={ref} className="input" {...props} />
    {error ? <span className="text-sm text-rose-500">{error}</span> : null}
  </label>
));

Input.displayName = "Input";
