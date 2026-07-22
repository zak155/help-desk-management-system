// src/lib/format.ts

/**
 * Converts a raw ticket auto-increment number into TKT-001 format.
 * Example: 1 -> "TKT-001", 12 -> "TKT-012"
 */
export function formatTicketId(ticketNumber: number): string {
  return `TKT-${String(ticketNumber).padStart(3, "0")}`;
}