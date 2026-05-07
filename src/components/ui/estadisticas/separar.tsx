"use client";
import { useMemo } from 'react';
import { mockActivityItems } from "@/data/actividadesMock";

export interface ActividadTransformada {
  id: number;
  title: string;
  pais: string;
  capital: string;
  ciudad: string;
  resto: string;
  lugar: string; 
  group: string;
  cantidadReal: number;
  cantidadEsperada: number;
  cantidadDeVeces: number;
  integrantes: number;
}

export const useActividades = (grupoUsuario: string) => {
  return useMemo(() => {
    if (!grupoUsuario) return { detallados: [], porCiudad: [], porPais: [], porTitulo: [] };
    
    const grupoBusqueda = grupoUsuario.trim().toLowerCase();

    const base = mockActivityItems
      .filter(item => item.group?.trim().toLowerCase() === grupoBusqueda)
      .map(item => {
        // Separamos por coma: [0]pais, [1]capital, [2]ciudad, [3]resto
        const partes = item.place.split(',').map(p => p.trim());
        
        const pais = partes[0] || "Sin País";
        const capital = partes[1] || "Sin Capital";
        const ciudad = partes[2] || "Sin Ciudad";
        const resto = partes[3] || "";

        return {
          ...item,
          id: Number(item.id),
          pais,
          capital,
          ciudad,
          resto,
          lugar: ciudad !== "Sin Ciudad" ? ciudad : capital, // Prioridad visual
          cantidadReal: Number(item.numero_beneficiados) || 0,
          cantidadEsperada: Number(item.numero_a_beneficiar) || 0,
          integrantes: Number(item.numero_participantes) || 0,
        };
      });

    const agruparPor = (lista: any[], llave: keyof ActividadTransformada) => {
      const mapa: Record<string, ActividadTransformada> = {};
      
      lista.forEach(item => {
        const valorLlave = String(item[llave]);
        if (!mapa[valorLlave]) {
          mapa[valorLlave] = { 
            ...item, 
            cantidadDeVeces: 0, 
            cantidadReal: 0, 
            cantidadEsperada: 0, 
            integrantes: 0 
          };
        }
        mapa[valorLlave].cantidadDeVeces += 1;
        mapa[valorLlave].cantidadReal += item.cantidadReal;
        mapa[valorLlave].cantidadEsperada += item.cantidadEsperada;
        mapa[valorLlave].integrantes += item.integrantes;
      });
      return Object.values(mapa);
    };

    return {
      detallados: base,
      porCiudad: agruparPor(base, 'ciudad'),
      porPais: agruparPor(base, 'pais'),
      porCapital: agruparPor(base, 'capital'), // Nueva agrupación disponible
      porTitulo: agruparPor(base, 'title')
    };
  }, [grupoUsuario]);
};