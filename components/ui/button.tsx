import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-forest text-sand shadow-soft hover:bg-forest/90 dark:bg-clay dark:text-sand dark:hover:bg-clay/90",
        outline:
          "border border-forest/20 bg-[rgb(var(--surface-card)/0.82)] text-forest hover:bg-[rgb(var(--surface-elevated)/0.9)] dark:border-mist/60 dark:bg-[rgb(var(--surface-elevated)/0.95)] dark:text-ink dark:hover:bg-[rgb(var(--surface-card)/1)]",
        ghost: "text-forest hover:bg-forest/5 dark:text-ink dark:hover:bg-white/10",
      },
      size: {
        default: "h-11 px-5",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };