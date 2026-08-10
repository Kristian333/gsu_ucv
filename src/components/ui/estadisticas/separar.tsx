"use client";
import { useMemo } from 'react';
export interface ActividadBackend {
  id: string;
  group_id: string;
  nombre_grupo: string;
  nombre: string;
  descripcion: string;
  fecha_inicio: string; 
  fecha_fin: string;    
  ubicacion: string;
  area_conocimiento: string;
  aliados?: string;
  participantes_grupo: number;
  participantes_estimados: number;
  participantes_reales: number;
  financiamiento?: string;
  observaciones?: string;
  reporte_revisado: boolean;
  creado_en: string;
  actualizado_en: string;
}

const AREAS_MAESTRAS = [
  "SALUD",
  "ACCIÓN SOCIAL",
  "CULTURAL",
  "DEPORTIVA",
  "AMBIENTE / CONSERVACIÓN",
  "INVESTIGACIÓN",
  "RECREACIÓN",
  "DEBATE",
  "OTROS"
];

export const useActividades = (actividadesRaw: ActividadBackend[] | undefined | null) => {
  return useMemo(() => {
    if (!actividadesRaw || !Array.isArray(actividadesRaw)) {
      return { porActividad: [], porEstado: [], porCiudad: [], porAnio: [], porAreaAnio: [], porGrupo: [], todasLasAreas: AREAS_MAESTRAS };
    }


    const porActividad: any[] = [];
    const mapaEstado: Record<string, number> = {};
    const mapaCiudad: Record<string, number> = {};
    const mapaGrupo: Record<string, Record<string, any>> = {}; 
    const mapaAnio: Record<string, number> = {};
    const mapaAreaAnio: Record<string, Record<string, number>> = {};
    const anioActual = new Date().getFullYear(); 
    const anioInicio = anioActual - 3; 
    const rangoAniosValidos: string[] = [];
    for (let anio = anioInicio; anio <= anioActual; anio++) {
      const anioStr = anio.toString();
      rangoAniosValidos.push(anioStr);
      
      mapaAnio[anioStr] = 0;
      mapaAreaAnio[anioStr] = {};
      AREAS_MAESTRAS.forEach((area) => {
        mapaAreaAnio[anioStr][area] = 0;
      });
    }
    actividadesRaw.forEach((item) => {
      const estimados = Number(item.participantes_estimados) || 0;
      const reales = Number(item.participantes_reales) || 0;
      const partes = item.ubicacion ? item.ubicacion.split(',').map(p => p.trim()) : [];
      const estado = partes[1] || "Sin Estado";    
      const ciudad = partes[2] || "Sin Ciudad";    
      const grupoNombre = item.nombre_grupo || "Grupo No Definido";

      let anio = "Sin Año";
      if (item.fecha_fin && item.fecha_fin.length >= 4) {
        anio = item.fecha_fin.substring(0, 4);
      }
      const esAnioVigente = anio === anioActual.toString();
      if (rangoAniosValidos.includes(anio)) {
        let areas: string[] = [];
        if (item.area_conocimiento) {
          try {
            const limpioJSON = item.area_conocimiento.replace(/\\"/g, '"');
            const parseado = JSON.parse(limpioJSON);
            areas = Array.isArray(parseado) ? parseado.map(a => String(a)) : [String(parseado)];
          } catch (e) {
            const textoLimpio = item.area_conocimiento.replace(/[\[\]"']/g, '').trim();
            areas = textoLimpio.split(',').map(a => a.trim());
          }
        }

        const areasUnicasDeEstaActividad = new Set<string>();
        areas.forEach((area) => {
          if (area) {
            let normalizada = area.toUpperCase().trim();
            if (normalizada === "AMBIENTE/CONSERVACIÓN" || normalizada === "AMBIENTE O CONSERVACIÓN") normalizada = "AMBIENTE / CONSERVACIÓN";
            if (normalizada === "ACCIÓN SOCIAL" || normalizada === "ACCION SOCIAL") normalizada = "ACCIÓN SOCIAL";
            if (normalizada === "INVESTIGACION") normalizada = "INVESTIGACIÓN";
            if (normalizada === "RECREACION") normalizada = "RECREACIÓN";
            
            if (AREAS_MAESTRAS.includes(normalizada)) {
              areasUnicasDeEstaActividad.add(normalizada);
            } else if (normalizada !== "") {
              areasUnicasDeEstaActividad.add("OTROS");
            }
          }
        });

        areasUnicasDeEstaActividad.forEach((area) => {
          mapaAreaAnio[anio][area] += 1;
        });

        mapaAnio[anio] += 1;
      }
      if (esAnioVigente) {
        if (estimados > 0 || reales > 0) {
          porActividad.push({
            lugar: item.nombre || "Sin Nombre", 
            cantidadEsperada: estimados,
            CantidadReal: reales,
            integrantes: Number(item.participantes_grupo) || 0
          });
          if (!mapaGrupo[grupoNombre]) {
            mapaGrupo[grupoNombre] = {
              lugar: grupoNombre,
              cantidadDeVeces: 0,
              cantidadEsperada: 0,
              CantidadReal: 0,
              integrantes: 0
            };
          }
          mapaGrupo[grupoNombre].cantidadDeVeces += 1;
          mapaGrupo[grupoNombre].cantidadEsperada += estimados;
          mapaGrupo[grupoNombre].CantidadReal += reales;
          mapaGrupo[grupoNombre].integrantes += Number(item.participantes_grupo) || 0;
        }

        mapaEstado[estado] = (mapaEstado[estado] || 0) + 1;
        mapaCiudad[ciudad] = (mapaCiudad[ciudad] || 0) + 1;
      }
    });


    const porEstado = Object.entries(mapaEstado).map(([estado, total]) => ({ lugar: estado, CantidadReal: total }));
    const porCiudad = Object.entries(mapaCiudad).map(([ciudad, total]) => ({ lugar: ciudad, CantidadReal: total }));
    const porAnio = Object.entries(mapaAnio).map(([anio, total]) => ({ lugar: anio, CantidadReal: total })).sort((a, b) => a.lugar.localeCompare(b.lugar));
    const porAreaAnio = Object.entries(mapaAreaAnio).map(([anio, areasDelAnio]) => ({ lugar: anio, ...areasDelAnio })).sort((a, b) => a.lugar.localeCompare(b.lugar));
    const porGrupo = Object.values(mapaGrupo).sort((a, b) => b.CantidadReal - a.CantidadReal);

    return { porActividad, porEstado, porCiudad, porAnio, porAreaAnio, porGrupo, todasLasAreas: AREAS_MAESTRAS };
  }, [actividadesRaw]);
};
