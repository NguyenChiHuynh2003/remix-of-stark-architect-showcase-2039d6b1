/**
 * Format a number as Vietnamese currency (VND)
 * @param value - The number to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export const formatCurrency = (
  value: number | null | undefined,
  options?: {
    showSymbol?: boolean;
    compact?: boolean;
  }
): string => {
  if (value === null || value === undefined) return "-";
  
  const { showSymbol = true, compact = false } = options || {};
  
  if (compact && Math.abs(value) >= 1_000_000_000) {
    // Billions - display as X.XX tỷ
    const billions = value / 1_000_000_000;
    return `${billions.toLocaleString("vi-VN", { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })} tỷ${showSymbol ? " ₫" : ""}`;
  }
  
  if (compact && Math.abs(value) >= 1_000_000) {
    // Millions - display as X.XX tr
    const millions = value / 1_000_000;
    return `${millions.toLocaleString("vi-VN", { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })} tr${showSymbol ? " ₫" : ""}`;
  }
  
  // Default formatting
  return new Intl.NumberFormat("vi-VN", {
    style: showSymbol ? "currency" : "decimal",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Parse a formatted currency string back to a number
 * @param value - The formatted string to parse
 * @returns The numeric value
 */
export const parseCurrency = (value: string): number => {
  if (!value) return 0;
  // Remove all non-numeric characters except minus and decimal
  const cleaned = value.replace(/[^\d,-]/g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
};
