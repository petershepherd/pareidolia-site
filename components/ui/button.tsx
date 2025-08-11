"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "secondary" | "outline" | "ghost";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
};

export function Button({ className, variant = "default", size = "md", asChild, ...props }: ButtonProps & { children?: React.ReactNode }) {
  const base = "inline-flex items-center justify-center whitespace-nowrap transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 disabled:opacity-50 disabled:pointer-events-none";
  const variants: Record<Variant, string> = {
    default: "bg-cyan-500 text-black hover:bg-cyan-400",
    secondary: "bg-white/10 text-white hover:bg-white/20",
    outline: "border border-white/20 text-white hover:bg-white/10",
    ghost: "text-neutral-300 hover:text-white hover:bg-white/5",
  };
  const sizes = {
    sm: "h-8 px-3 rounded-xl text-sm",
    md: "h-10 px-4 rounded-xl text-sm",
    lg: "h-12 px-5 rounded-2xl text-base",
  } as const;
  const cls = cn(base, variants[variant], sizes[size], className);
  return <button className={cls} {...props} />;
}
