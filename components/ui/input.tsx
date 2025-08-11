import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-xl border border-white/20 bg-black/30 px-3 text-sm text-white",
        "placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-cyan-500",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
