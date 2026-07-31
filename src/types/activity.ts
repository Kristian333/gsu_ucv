// types/activity.ts

export interface ActivityBackend {
  id: string
  group_id: string
  nombre_grupo?: string
  nombre: string
  descripcion?: string
  fecha?: string
  ubicacion?: string
  area_conocimiento?: string
  aliados?: string
  participantes_grupo: number
  participantes_estimados: number
  participantes_reales: number
  financiamiento?: string
  observaciones?: string
  cubierta?: string
  lista_participantes?: string
  galeria_url?: string
  reporte_revisado: boolean
  destacado: boolean
  creado_en?: string
  actualizado_en?: string
}

export interface GetActivitiesBackendResponse {
  actividades: ActivityBackend[]
  pagina?: {
    total_registros: number
    total_paginas: number
    pagina_actual: number
    por_pagina: number
  }
}