// components/ui/tabla-nuestras-actividades
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
  useToast,
} from "@chakra-ui/react";
import { StarIcon } from "@chakra-ui/icons";
import { FiEdit, FiEye, FiInfo } from "react-icons/fi"; 
import { FaRegFileAlt } from "react-icons/fa";
import { apiRequest } from "@/components/formularios/api";
import { formatActivityDateRange, getActivityStatus } from "@/utils/common";

export interface Actividad {
  id: number | string;
  nombre?: string;
  ubicacion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  reporte_revisado?: boolean;
  destacado?: boolean;
  participantes_reales?: number | string | null;
}

interface TablaProps {
  actividades: Actividad[];
  onRefresh?: () => void;      
}

export default function TablaNuestrasActividades({
  actividades,
  onRefresh,
}: TablaProps) {
  const toast = useToast();
  const [loadingId, setLoadingId] = useState<string | number | null>(null);

  const handleToggleDestacada = async (act: Actividad) => {
    const isCurrentlyFeatured = !!act.destacado;
    const newFeaturedState = !isCurrentlyFeatured;
    const totalDestacadasActuales = (actividades || []).filter(a => a.destacado).length;

    if (newFeaturedState && totalDestacadasActuales >= 4) {
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
          destacado: newFeaturedState,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response && !response.error) {
        toast({
          title: newFeaturedState ? "Actividad destacada" : "Destacado removido",
          status: "success",
          duration: 2000,
          position: "top"
        });
        if (onRefresh) onRefresh(); 
      } else {
        throw new Error(response?.message || "Error al actualizar estado destacado.");
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
    <Box border="1px solid" borderColor="gray.200" borderRadius="md" bg="white" w="full">
      <Table variant="simple" size="md" w="full" layout="auto">
        <Thead bg="gray.50">
          <Tr>
            <Th fontSize="sm" py={3}>Nombre</Th>
            <Th fontSize="sm" py={3}>Lugar</Th>
            <Th fontSize="sm" py={3}>Fecha</Th>
            <Th fontSize="sm" py={3} textAlign="center">Destacada</Th>
            <Th fontSize="sm" py={3} isNumeric>Acciones</Th>
          </Tr>
        </Thead>

        <Tbody>
          {actividades.length === 0 ? (
            <Tr>
              <Td colSpan={5} textAlign="center" py={8}>
                <Text color="gray.500" fontSize="md">No se encontraron actividades.</Text>
              </Td>
            </Tr>
          ) : (
            actividades.map((act) => {
              // Parseo numérico para participantes_reales antes de evaluar status
              const numParticipants = act.participantes_reales !== null && act.participantes_reales !== undefined
                ? Number(act.participantes_reales)
                : null;

              const statusInfo = getActivityStatus({
                fecha_inicio: act.fecha_inicio,
                fecha_fin: act.fecha_fin,
                participantes_reales: numParticipants,
                reporte_revisado: act.reporte_revisado,
              });

              // Determinar la lógica de UI por etiquetas exactas de getActivityStatus
              const esFutura = statusInfo.label === 'Actividad Futura';
              const enCurso = statusInfo.label === 'Actividad En Curso';
              const esperaReporte = statusInfo.label === 'A la Espera de Reporte';
              
              // Solo se pueden destacar las actividades que ya pasaron de fecha
              const esFinalizada = !esFutura && !enCurso;

              const nombreActividad = act.nombre || "Actividad sin título";
              const lugarActividad = act.ubicacion || "-";
              const fechaRango = formatActivityDateRange(act.fecha_inicio, act.fecha_fin);
              const esDestacado = !!act.destacado;

              return (
                <Tr key={act.id}>
                    {/* Nombre */}
                  <Td fontWeight="medium" fontSize="md">
                    <Link
                      as={NextLink}
                      href={`/admingroup/actividad/${act.id}`}
                      color="teal.600"
                      fontWeight="bold"
                      _hover={{ textDecoration: "underline", color: "teal.800" }}
                    >
                      {nombreActividad}
                    </Link>
                  </Td>

                  {/* Lugar */}
                  <Td color="gray.700" fontSize="md">{lugarActividad}</Td>
                  
                  {/* Fecha */}
                  <Td fontSize="sm" color="gray.700">
                    {fechaRango}
                  </Td>

                  {/* Columna de Destacadas */}
                  <Td textAlign="center">
                    <Tooltip 
                      label={
                        !esFinalizada
                        ? "Solo se pueden destacar actividades que ya hayan finalizado"
                          : esDestacado 
                            ? "Quitar de destacadas" 
                            : "Marcar como destacada"
                      }
                      placement="top"
                    >
                      <Box display="inline-block">
                        <IconButton
                          aria-label="Destacar actividad"
                          icon={<StarIcon color={esDestacado ? "yellow.400" : "gray.300"} />}
                          variant="ghost"
                          fontSize="xl"
                          size="sm"
                          isLoading={loadingId === act.id}
                          isDisabled={!esFinalizada}
                          onClick={() => handleToggleDestacada(act)}
                          _hover={{ transform: esFinalizada ? "scale(1.2)" : "none" }}
                          transition="all 0.2s"
                        />
                      </Box>
                    </Tooltip>
                  </Td>

                  {/* Acciones */}
                  <Td isNumeric>
                    {/* Actividad Futura: Permite Editar */}
                    {esFutura && (
                      <Tooltip label="Editar actividad planificada">
                        <IconButton
                          as={NextLink}
                          href={`/admingroup/modificar_actividad/${act.id}`}
                          aria-label="Editar"
                          icon={<FiEdit />}
                          size="md"
                          variant="ghost"
                          colorScheme="teal"
                        />
                      </Tooltip>
                    )}
                    {/* Actividad En Curso: Ver actividad */}
                    {enCurso && (
                      <Tooltip label="Ver actividad en curso">
                        <IconButton
                          as={NextLink}
                          href={`/actividad/${act.id}`}
                          aria-label="Ver Actividad"
                          icon={<FiEye />}
                          size="md"
                          variant="ghost"
                          colorScheme="blue"
                        />
                      </Tooltip>
                    )}
                    {/* Finalizada sin reporte: Llenar reporte */}
                    {esperaReporte && (
                      <Tooltip label="Hacer reporte final">
                        <IconButton
                          as={NextLink}
                          href={`/admingroup/reporte/${act.id}`}
                          aria-label="Reporte"
                          icon={<FaRegFileAlt />}
                          size="md"
                          variant="ghost"
                          colorScheme="orange"
                        />
                      </Tooltip>
                    )}
                    {/* Finalizada con reporte completado: Ver información completa */}
                    {!esFutura && !enCurso && !esperaReporte && (
                      <Tooltip label="Ver Información Completa">
                        <IconButton
                          as={NextLink}
                          href={`/admingroup/actividad/${act.id}`}
                          aria-label="Ver Información Completa"
                          icon={<FiInfo />}
                          size="md"
                          variant="ghost"
                          colorScheme="teal"
                        />
                      </Tooltip>
                    )}
                  </Td>
                </Tr>
              );
            })
          )}
        </Tbody>
      </Table>
    </Box>
  );
}
