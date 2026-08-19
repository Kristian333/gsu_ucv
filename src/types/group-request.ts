// types/group-request.ts

import { GroupDetailBackend } from "./group";

export interface Approval {
  id: string;
  facultad: string;
  estado: string;
  revisado_en?: string;
}

export interface GroupRequestDetails {
  id: string;
  grupo_id: string;
  grupo_nombre: string;
  comentarios: string;
  estado: string;
  facultad: string;
  creado_en: string;
  actualizado_en: string;
  aprobaciones: Approval[];
  // Información detallada del grupo recuperada desde /groups/{grupo_id}
  grupo_detalle?: GroupDetailBackend | null;
}