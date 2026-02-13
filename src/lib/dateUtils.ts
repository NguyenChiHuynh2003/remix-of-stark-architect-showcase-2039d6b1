import { format } from "date-fns";

/**
 * Format a date string to dd/MM/yyyy (Vietnamese date format)
 */
export const formatDateVN = (date: string | Date | null): string => {
  if (!date) return "-";
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    return format(d, "dd/MM/yyyy");
  } catch {
    return "-";
  }
};

/**
 * Format a date string to dd/MM/yyyy HH:mm
 */
export const formatDateTimeVN = (date: string | Date | null): string => {
  if (!date) return "-";
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    return format(d, "dd/MM/yyyy HH:mm");
  } catch {
    return "-";
  }
};
