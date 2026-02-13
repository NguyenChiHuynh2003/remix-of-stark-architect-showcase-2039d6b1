import * as React from "react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatCurrency";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface CurrencyDisplayProps {
  value: number | null | undefined;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "positive" | "negative" | "muted" | "income" | "expense";
  showSymbol?: boolean;
  compact?: boolean;
  showTooltip?: boolean;
  hideValue?: boolean;
}

const sizeStyles = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg font-semibold",
  xl: "text-2xl font-bold",
};

const variantStyles = {
  default: "text-foreground",
  positive: "text-emerald-600 dark:text-emerald-400",
  negative: "text-red-600 dark:text-red-400",
  muted: "text-muted-foreground",
  income: "text-emerald-600 dark:text-emerald-400",
  expense: "text-orange-600 dark:text-orange-400",
};

export const CurrencyDisplay = React.forwardRef<HTMLSpanElement, CurrencyDisplayProps>(
  (
    {
      value,
      className,
      size = "md",
      variant = "default",
      showSymbol = true,
      compact = false,
      showTooltip = true,
      hideValue = false,
    },
    ref
  ) => {
    if (hideValue) {
      return (
        <span ref={ref} className={cn(sizeStyles[size], "text-muted-foreground", className)}>
          -
        </span>
      );
    }

    if (value === null || value === undefined) {
      return (
        <span ref={ref} className={cn(sizeStyles[size], "text-muted-foreground", className)}>
          -
        </span>
      );
    }

    // Auto-detect variant based on value if using income/expense logic
    const computedVariant =
      variant === "default" && value < 0 ? "negative" : variant;

    const formattedValue = formatCurrency(value, { showSymbol, compact });
    const fullValue = formatCurrency(value, { showSymbol: true, compact: false });

    // Show tooltip only if compact and value is large enough to be abbreviated
    const shouldShowTooltip = showTooltip && compact && Math.abs(value) >= 1_000_000;

    const content = (
      <span
        ref={ref}
        className={cn(
          sizeStyles[size],
          variantStyles[computedVariant],
          "tabular-nums tracking-tight font-medium",
          className
        )}
      >
        {formattedValue}
      </span>
    );

    if (shouldShowTooltip) {
      return (
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>{content}</TooltipTrigger>
            <TooltipContent side="top" className="font-mono text-sm">
              {fullValue}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return content;
  }
);

CurrencyDisplay.displayName = "CurrencyDisplay";

/**
 * StatCard component for displaying currency values in a card format
 */
export interface CurrencyStatCardProps {
  label: string;
  value: number | null | undefined;
  icon?: React.ReactNode;
  variant?: "income" | "expense" | "default";
  compact?: boolean;
  hideValue?: boolean;
}

export const CurrencyStatCard = ({
  label,
  value,
  icon,
  variant = "default",
  compact = true,
  hideValue = false,
}: CurrencyStatCardProps) => {
  const bgColors = {
    income: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800",
    expense: "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800",
    default: "bg-card border-border",
  };

  return (
    <div className={cn("p-4 rounded-xl border", bgColors[variant])}>
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <CurrencyDisplay
        value={value}
        size="xl"
        variant={variant}
        compact={compact}
        hideValue={hideValue}
      />
    </div>
  );
};
