"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const VARIANT_CLASSES: Record<string, string> = {
  primary: "bg-brand text-white hover:bg-brand-dark active:scale-[0.98]",
  secondary:
    "bg-white text-ink border border-line hover:border-brand/40 active:scale-[0.98]",
  ghost: "bg-transparent text-ink hover:bg-black/5 active:scale-[0.98]",
  danger: "bg-white text-status-bekliyor border border-status-bekliyor/30 hover:bg-status-bekliyorBg",
};

const SIZE_CLASSES: Record<string, string> = {
  sm: "text-sm px-3 py-1.5 rounded-lg",
  md: "text-sm px-4 py-2.5 rounded-lg",
  lg: "text-base px-5 py-3.5 rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", loading, children, disabled, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "font-medium transition-all disabled:opacity-50 disabled:pointer-events-none inline-flex items-center justify-center gap-2",
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          className
        )}
        {...props}
      >
        {loading ? "..." : children}
      </button>
    );
  }
);
Button.displayName = "Button";
