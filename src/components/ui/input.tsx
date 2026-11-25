// src/components/ui/input.tsx
import * as React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, helperText, error, id, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div className="w-full flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-slate-700">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={twMerge(
            clsx(
              "w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900",
              "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500",
              "disabled:bg-slate-100 disabled:cursor-not-allowed transition-colors",
              error && "border-red-500 focus:ring-red-400 focus:border-red-500",
              className
            )
          )}
          {...props}
        />
        {helperText && !error && (
          <p className="text-xs text-slate-500">{helperText}</p>
        )}
        {error && (
          <p className="text-xs font-medium text-red-600">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

