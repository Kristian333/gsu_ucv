// utils/common.ts

/**
 * Normaliza un objeto Date reiniciando las horas a 00:00:00.000
 */
export function normalizeDate(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Convierte un string de fecha en objeto Date.
 * Soporta formatos ISO ("2026-11-30T00:00:00Z" o "2026-11-30") y "DD/MM/YYYY".
 */
export function parseDate(dateStr: string): Date {
  if (!dateStr) return new Date();

  // Si viene en formato "DD/MM/YYYY" o "DD-MM-YYYY"
  if (dateStr.includes("/") || dateStr.includes("-")) {
    const separator = dateStr.includes("/") ? "/" : "-";
    const parts = dateStr.split(separator);

    // Si la primera parte es de 4 dígitos, es ISO "YYYY-MM-DD"
    if (parts[0].length === 4) {
      return new Date(dateStr);
    }

    // De lo contrario asumimos "DD/MM/YYYY" o "DD-MM-YYYY"
    const [day, month, year] = parts.map(Number);
    if (day && month && year) {
      return new Date(year, month - 1, day);
    }
  }

  return new Date(dateStr);
}

/**
 * Formatea una fecha en formato corto "DD/MM/YYYY".
 */
export function formatDateToClient(dateInput: Date | string): string {
  if (!dateInput) return "";
  const date = typeof dateInput === "string" ? parseDate(dateInput) : dateInput;

  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Recibe dos fechas (pueden ser cadenas ISO, "DD/MM/YYYY" u objetos Date).
 * Si la fecha de inicio y la fecha de fin son iguales, retorna un solo string ("DD/MM/YYYY").
 * Si son distintas, retorna "DD/MM/YYYY al DD/MM/YYYY".
 */
export function formatActivityDateRange(
  startDateInput: Date | string,
  endDateInput: Date | string
): string {
  if (!startDateInput && !endDateInput) return "";
  if (!startDateInput) return formatDateToClient(endDateInput);
  if (!endDateInput) return formatDateToClient(startDateInput);

  const startFormatted = formatDateToClient(startDateInput);
  const endFormatted = formatDateToClient(endDateInput);

  if (startFormatted === endFormatted) {
    return startFormatted;
  }

  return `${startFormatted} al ${endFormatted}`;
}