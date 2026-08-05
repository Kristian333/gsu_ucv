"use client";
import React, { useState } from "react";
import NextLink from "next/link";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Tooltip,
  Link,
  Text,
  Checkbox,
  useToast,
} from "@chakra-ui/react";
import { FiEdit } from "react-icons/fi";
import { FaRegFileAlt } from "react-icons/fa";
import { apiRequest } from "@/components/formularios/api";

interface Actividad {
  id: number | string;
  title?: string;
  nombre?: string; 
  place?: string;
  location?: string; 
  fecha_inicio?: string; 
  fecha_fin?: string;    
  group?: string;
  reporte_completado?: boolean;
  destacado?: boolean; 
  participantes_reales?: number | string | null;
}

interface TablaProps {
  actividades: Actividad[];
  permitirEditar?: boolean;
  mostrarDestacados?: boolean; 
  onRefresh?: () => void;      
}

export default function TablaNuestrasActividades({
  actividades,
  permitirEditar = false,
  mostrarDestacados = false,
  onRefresh,
}: TablaProps) {
  const toast = useToast();
  const [loadingId, setLoadingId] = useState<string | number | null>(null);

  function parseLocalDate(dateStr?: string | null): Date | null {
    if (!dateStr) return null;
    
    if (dateStr.includes("-")) {
      return new Date(dateStr.substring(0, 10) + "T00:00:00");
    }

    const parts = dateStr.split("/");
    if (parts.length < 3) return null;

    return new Date(
      Number(parts[2]),
      Number(parts[1]) - 1,
      Number(parts[0]),
    );
  }

  function normalizeToMidnight(d?: Date | null) {
    if (!d) return null;
    const nd = new Date(d);
    nd.setHours(0, 0, 0, 0);
    return nd;
  }

  const today = normalizeToMidnight(new Date())!;

  const listaProcesada = (actividades || []).map((a) => {
    const start = parseLocalDate(a.fecha_inicio);
    const end = parseLocalDate(a.fecha_fin);

    return {
      ...a,
      _start: normalizeToMidnight(start),
      _end: normalizeToMidnight(end),
    };
  });

  const format = (d?: Date | null) =>
    d ? d.toLocaleDateString("es-ES") : "-";

  const handleToggleDestacada = async (act: Actividad, isChecked: boolean) => {
    const totalDestacadasActuales = (actividades || []).filter(a => a.destacado).length;

    if (isChecked && totalDestacadasActuales >= 4) {
      toast({
        title: "Límite alcanzado",
        description: "Solo puedes tener un máximo de 4 actividades destacadas por grupo.",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "top"
      });
      return;
    }

    setLoadingId(act.id);
    try {
      const token = localStorage.getItem("token") || "";
      const idString = String(act.id);

      const response = await apiRequest(`activities/feature`, {
        method: "PATCH",
        body: JSON.stringify({
          id: idString,
          activity_id: idString,
          activityId: idString,
          destacado: isChecked,
          is_featured: isChecked
        }),
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response && !response.error) {
        toast({
          title: isChecked ? "Actividad destacada" : "Destacado removido",
          status: "success",
          duration: 2000,
          position: "top"
        });
        if (onRefresh) onRefresh(); 
      } else {
        throw new Error(response?.message || "Error devuelto por el servidor.");
      }
    } catch (err: any) {
      toast({
        title: "Error de servidor",
        description: err.message || "No se pudo actualizar el estado destacado.",
        status: "error",
        position: "top"
      });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Box bg="white" p={6} rounded="md" shadow="sm" overflowX="auto">
      <Table variant="simple">
        <Thead bg="gray.50">
          <Tr>
            <Th>Nombre</Th>
            <Th>Lugar</Th>
            <Th>Fecha Inicio</Th>
            <Th>Fecha Fin</Th>
            {mostrarDestacados && <Th textAlign="center">Destacada</Th>}
            <Th isNumeric>Acción</Th>
          </Tr>
        </Thead>

        <Tbody>
          {listaProcesada.map((act) => {
            const start = act._start;
            const end = act._end;

            const calificaParaReporte = !!end && today.getTime() >= end.getTime();

            const tieneReporteSubido = act.reporte_completado || 
                                       (act.participantes_reales !== undefined && 
                                        act.participantes_reales !== null && 
                                        act.participantes_reales !== "" && 
                                        Number(act.participantes_reales) > 0);

            const nombreActividad = act.nombre || act.title || "Actividad sin título";
            const lugarActividad = act.location || act.place || "-";

            return (
              <Tr key={act.id}>
                <Td>
                  <Link
                    as={NextLink}
                    href={`/actividad/${act.id}`}
                    color="teal.600"
                    fontWeight="bold"
                    _hover={{ textDecoration: "underline", color: "teal.800" }}
                  >
                    {nombreActividad}
                  </Link>
                </Td>

                <Td>{lugarActividad}</Td>
                <Td>{format(start)}</Td>
                <Td>{format(end)}</Td>

                {/* Columna interactiva libre de Destacadas */}
                {mostrarDestacados && (
                  <Td textAlign="center">
                    <Checkbox
                      colorScheme="teal"
                      isChecked={!!act.destacado}
                      isDisabled={loadingId === act.id} 
                      onChange={(e) => handleToggleDestacada(act, e.target.checked)}
                    />
                  </Td>
                )}

                <Td isNumeric>
                  {permitirEditar && (
                    <Tooltip label="Editar actividad">
                      <IconButton
                        as={NextLink}
                        href={`/admingroup/modificar_actividad/${act.id}`} 
                        aria-label="Editar"
                        icon={<FiEdit />}
                        size="sm"
                        variant="ghost"
                        colorScheme="teal"
                      />
                    </Tooltip>
                  )}

                  {calificaParaReporte && !tieneReporteSubido && (
                    <Tooltip label="Hacer reporte final">
                      <IconButton
                        as={NextLink}
                        href={`/admingroup/reporte/${act.id}`}
                        aria-label="Reporte"
                        icon={<FaRegFileAlt />}
                        size="sm"
                        variant="ghost"
                        colorScheme="orange"
                        ml={permitirEditar ? 2 : 0}
                      />
                    </Tooltip>
                  )}

                  {(!permitirEditar && tieneReporteSubido) || (!permitirEditar && !calificaParaReporte) ? (
                    <Text fontSize="xs" color="gray.400" fontStyle="italic">Sin acciones</Text>
                  ) : null}
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Box>
  );
}
