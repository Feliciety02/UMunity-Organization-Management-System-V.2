import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const appButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary-deep",
        secondary: "border border-border bg-background text-foreground hover:bg-secondary",
        ghost: "bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground",
        gold: "bg-gradient-gold text-primary-deep hover:brightness-95",
        subtle: "bg-secondary text-foreground hover:bg-[color:color-mix(in_oklab,var(--primary)_8%,white)]",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-11 px-5 text-sm",
        icon: "h-10 w-10",
      },
      shape: {
        pill: "rounded-full",
        soft: "rounded-xl",
      },
      shadow: {
        none: "",
        soft: "shadow-soft",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
      shape: "pill",
      shadow: "none",
    },
  },
);

export interface AppButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof appButtonVariants> {
  asChild?: boolean;
}

export function AppButton({
  className,
  variant,
  size,
  shape,
  shadow,
  asChild = false,
  ...props
}: AppButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(appButtonVariants({ variant, size, shape, shadow, className }))} {...props} />;
}

export { appButtonVariants };
