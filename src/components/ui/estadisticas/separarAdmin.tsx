"use client";
import { useMemo } from 'react';
import { mockActivityItems } from "@/data/actividadesMock";

export const useActividadesAdmin = () => {
  return useMemo(() => {
    // 1. Transformación de la base con jerarquía: País, Estado, Ciudad, Lugar
    const base = mockActivityItems.map(item => {
      // Limpiamos el string y separamos por comas
      const partes = (item.place || "").split(',').map(p => p.trim());
      
      /**
       * Orden solicitado:
       * 1° País, 2° Estado, 3° Ciudad, 4° en adelante es Lugar
       */
      const pais   = partes[0] || "Sin País";
      const estado = partes[1] || "Sin Estado";
      const ciudad = partes[2] || "Sin Ciudad";
      
      // Captura todo lo que venga después de la tercera coma como "lugar"
      const lugar  = partes.slice(3).join(', ') || "Sin Dirección";
      
      return {
        ...item,
        id: Number(item.id),
        pais,
        estado,
        ciudad,
        lugar,
        // Conversión segura de números
        cantidadReal: Math.max(0, Number(item.numero_beneficiados) || 0),
        cantidadEsperada: Math.max(0, Number(item.numero_a_beneficiar) || 0),
        integrantes: Math.max(0, Number(item.numero_participantes) || 0),
      };
    });

    // 2. Función de agrupación genérica
    const agruparPor = (lista: any[], llave: string) => {
      const mapa: Record<string, any> = {};
      
      lista.forEach(item => {
        const valorLlave = item[llave] || "No definido";
        
        if (!mapa[valorLlave]) {
          mapa[valorLlave] = { 
            ...item, 
            nombreGrupo: valorLlave, // Etiqueta útil para mostrar en tablas/gráficas
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

    // 3. Retorno de todas las agrupaciones necesarias
    return {
      detallados: base,
      porPais: agruparPor(base, 'pais'),
      porEstado: agruparPor(base, 'estado'),
      porCiudad: agruparPor(base, 'ciudad'),
      porLugar: agruparPor(base, 'lugar'),
      porTitulo: agruparPor(base, 'title'),
      porGrupo: agruparPor(base, 'group')
    };
  }, []); // Se ejecuta solo una vez al montar el componente
};