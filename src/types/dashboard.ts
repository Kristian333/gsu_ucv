// src/types/dashboard.ts
export interface GroupDashboardResponse {
  group_id: string;
  actividades_futuras: number;
  reportes_pendientes: number;
}

export interface FacultyDashboardResponse {
  facultad: string;
  solicitudes_pendientes: number;
  grupos_totales: number;
}

export interface ResourceRequestsByFaculty {
  facultad: string;
  solicitudes: number;
}

export interface DeuDashboardResponse {
  solicitudes_pendientes_deu: number;
  solicitudes_recursos_por_facultad: ResourceRequestsByFaculty[];
  grupos_activos_totales: number;
  grupos_inactivos_totales: number;
}