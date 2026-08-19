// utils/common.ts

export interface ActivityStatusInfo {
  label: string
  colorScheme: string
}

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
export function formatDateToClient(dateInput: Date | string | null | undefined): string {
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
  startDateInput: Date | string| null | undefined,
  endDateInput: Date | string| null | undefined
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

/**
 * Calcula el estado dinámico de una actividad basándose en las fechas actuales,
 * los beneficiados reales y el estado del reporte.
 */
export function getActivityStatus(activity: {
  fecha_inicio?: string | Date | null
  fecha_fin?: string | Date | null
  participantes_reales?: number | null
  reporte_revisado?: boolean
}): ActivityStatusInfo {
  const now = normalizeDate(new Date())

  const startDate = activity.fecha_inicio
    ? normalizeDate(parseDate(activity.fecha_inicio.toString()))
    : now
  const endDate = activity.fecha_fin
    ? normalizeDate(parseDate(activity.fecha_fin.toString()))
    : startDate

  // 1. Actividad Futura
  if (now < startDate) {
    return { label: 'Actividad Futura', colorScheme: 'secondary' }
  }

  // 2. Actividad En Curso
  if (now >= startDate && now <= endDate) {
    return { label: 'Actividad En Curso', colorScheme: 'primary' }
  }

  // 3. Actividad Finalizada (now > endDate)
  const hasParticipants =
    activity.participantes_reales !== null &&
    activity.participantes_reales !== undefined &&
    activity.participantes_reales > 0

  if (!hasParticipants) {
    return { label: 'A la Espera de Reporte', colorScheme: 'orange' }
  }

  if (!activity.reporte_revisado) {
    return { label: 'Reporte Pendiente de Revisión', colorScheme: 'yellow' }
  }

  return { label: 'Reporte Revisado', colorScheme: 'green' }
}

/**
 * Genera la ruta de la imagen para la facultad dada.
 * Ejemplo: "Ciencias Económicas" -> "/facultades/ciencias_economicas.jpg"
 */
export function getFacultyImagePath(facultadName?: string): string {
  if (!facultadName) return "/logo.png"; // Fallback por defecto

  const normalized = facultadName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remueve tildes/acentos
    .replace(/\s+/g, "_")            // Reemplaza espacios por '_'
    .replace(/[^a-z0-9_]/g, "");      // Remueve caracteres especiales sobrantes

  return `/facultades/${normalized}.png`;
}

/**
 * Formatea una lista de elementos (string, array o null/undefined) 
 */
export function formatListToString(value: string | string[] | null | undefined): string {
  if (!value) return "N/A";
  
  if (Array.isArray(value)) {
    const filtered = value.filter((item) => item !== "DEU");
    return filtered.length > 0 ? filtered.join(" / ") : "";
  }

  return value === "DEU" ? "" : value;
}