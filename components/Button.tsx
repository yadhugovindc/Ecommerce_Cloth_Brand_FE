"use client";

import { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

type Variant = "primary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-dark text-white hover:opacity-85 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed",
  outline:
    "border border-ink text-ink hover:bg-ink hover:text-bg transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
  ghost: "text-ink underline-offset-4 hover:underline",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-xs uppercase tracking-[0.15em]",
  md: "px-6 py-3 text-xs uppercase tracking-[0.15em]",
  lg: "px-8 py-4 text-xs uppercase tracking-[0.15em]",
};

interface ButtonProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  onClick,
  type = "button",
  disabled,
  className = "",
}: ButtonProps) {
  const classes = `${variants[variant]} ${sizes[size]} inline-flex items-center justify-center gap-2 ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}