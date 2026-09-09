export interface ActivityParticipantsMetric {
  lugar: string;
  cantidadEsperada: number;
  CantidadReal: number;
  integrantes: number;
}

export interface ActivitiesByStateMetric {
  lugar: string;
  CantidadReal: number;
}

export interface GroupParticipantsMetric {
  lugar: string;
  cantidadEsperada: number;
  CantidadReal: number;
  integrantes: number;
  cantidadDeVeces: number;
}

export interface ActivitiesByCityMetric {
  lugar: string;
  CantidadReal: number;
}

export interface YearlyActivitiesMetric {
  lugar: string;
  CantidadReal: number;
}

export interface GroupAnalyticsResponse {
  participantes_por_actividad: ActivityParticipantsMetric[];
  actividades_por_estado: ActivitiesByStateMetric[];
  participantes_por_grupo: GroupParticipantsMetric[];
  actividades_por_ciudad: ActivitiesByCityMetric[];
  historico_por_anio: YearlyActivitiesMetric[];
  areas_conocimiento_por_anio: Record<string, any>[];
}