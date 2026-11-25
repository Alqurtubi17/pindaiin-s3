// src/components/ui/card.tsx
import * as React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "accent";
}

export function Card({ className, variant = "default", children, ...props }: CardProps) {
  const variantStyles = {
    default: "bg-white border border-slate-200 rounded-2xl p-4 shadow-sm",
    elevated: "bg-white border border-slate-100 rounded-2xl p-5 shadow-md shadow-slate-100",
    accent: "bg-sky-50 border border-sky-200 rounded-2xl p-4 text-sky-950",
  };

  return (
    <div className={twMerge(clsx(variantStyles[variant], className))} {...props}>
      {children}
    </div>
  );
}

