// /data/testLog.ts

export interface LogEntry {
  date: string;     // ISO date string
  id: string;       // user ID
  evento: string;   // event name
}

// Log simulado (temporal hasta tener backend real)
export const testLog: LogEntry[] = [
  { date: "2024-12-01T14:22:00Z", id: "2", evento: "NuevoUsuario" },
  { date: "2024-12-09T17:25:00Z", id: "3", evento: "GrupoInfoValida" },

];
