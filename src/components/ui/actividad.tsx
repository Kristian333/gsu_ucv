// src/components/ui/actividad.tsx
"use client";

import React from "react";
import { Box, Flex, Heading, Text, Image, VStack, Divider, Link as ChakraLink } from "@chakra-ui/react";
import NextLink from "next/link";

interface ActivityBackend {
  id: string;
  group_id: string;
  nombre_grupo?: string;
  nombre: string;
  descripcion: string;
  fecha: string;
  ubicacion?: string;
  area_conocimiento: string;
  aliados?: string;
  participantes_grupo?: number;
  participantes_estimados?: number;
  participantes_reales?: number;
  financiamiento?: string;
  observaciones?: string;
  cubierta?: string;
  gallery_url?: string;
}

interface Props {
  activityId: string;
  activity: ActivityBackend | null;
}

// Función auxiliar para transformar la fecha "YYYY-MM-DD" o ISO -> "DD/MM/YYYY"
function formatBackendDate(isoString: string): string {
  if (!isoString) return "";
  try {
    const dateObj = new Date(isoString);
    if (isNaN(dateObj.getTime())) return isoString;
    
    const day = String(dateObj.getUTCDate()).padStart(2, '0');
    const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
    const year = dateObj.getUTCFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (e) {
    return isoString;
  }
}

export default function ActivityClientPage({ activityId, activity }: Props) {
  const placeholderImage = "/imagen-no-disponible.jpg";

  // Actividad no Encontrada
  if (!activity) {
    return (
      <Box maxW="4xl" mx="auto" p={10} textAlign="center">
        <Heading size="lg">Actividad no encontrada</Heading>
        <Text mt={4}>No existe una actividad con el ID {activityId}.</Text>
      </Box>
    );
  }

  // Usar la imagen de cubierta entregada por la API o el fallback
  const finalImageUrl = activity.cubierta && activity.cubierta.trim() !== "" 
    ? activity.cubierta 
    : placeholderImage;

  // Formatear la fecha
  const fechaFormateada = formatBackendDate(activity.fecha);

  // Lógica futura para la galería (falsa de momento)
  const showDriveGallery = Boolean(activity.gallery_url && activity.gallery_url.trim() !== "");

  {/* Pagina del Actividad */}
  return (
    <Box maxW="6xl" mx="auto" p={8} my={8} bg="white" rounded="lg" shadow="xl">
      <VStack spacing={12} align="stretch">

        {/* Imagen + Info */}
        <Flex
          direction={{ base: "column", md: "row" }}
          align="top"
          gap={10}
        >
          {/* Imagen */}
          <Image
            src={finalImageUrl}
            alt={activity.nombre}
            w="450px"
            h="300px"
            objectFit="cover"
            borderRadius="2xl"
            shadow="lg"
            fallbackSrc={placeholderImage}
          />

          {/* Info básica */}
          <VStack align="start" spacing={3} flex="1" alignItems="center">
            <Heading size="2xl" color="primary" alignSelf="center" textAlign="center">
              {activity.nombre}
            </Heading>

            {/* Enlace o Nombre del Grupo */}
              <Text fontSize="xl" color="gray.600">
                <strong>Grupo:</strong>{" "}
                {activity.group_id ? (
                  <ChakraLink
                    as={NextLink}
                    href={`/grupo/${activity.group_id}`}
                    color="primary"
                    _hover={{ textDecoration: "underline", color: "primary.600" }}
                  >
                    {activity.nombre_grupo || `Grupo #${activity.group_id}`}
                  </ChakraLink>
                ) : (
                <Text as="span" color="red.400" fontStyle="italic">
                  (Grupo no disponible temporalmente)
                </Text>
              )}
            </Text>

            {/* Fecha */}
            {activity.fecha && (
              <Text fontSize="lg" color="gray.500">
                📅 <strong>Fecha:</strong> {fechaFormateada}
              </Text>
            )}

            {/* Ubicación */}
            {activity.ubicacion && activity.ubicacion.trim() !== "" && (
              <Text fontSize="lg" color="gray.500">
                📍 <strong>Ubicación:</strong> {activity.ubicacion}
              </Text>
            )}

            {/* Área de Conocimiento */}
            {activity.area_conocimiento && (
              <Text fontSize="lg" color="gray.500">
                📚 <strong>Área:</strong> {activity.area_conocimiento}
              </Text>
            )}

            {/* Campos adicionales condicionales post reporte */}
            {/* Aliados */}
            {activity.aliados && activity.aliados.trim() !== "" && (
              <Text fontSize="md" color="gray.600">
                🤝 <strong>Aliados:</strong> {activity.aliados}
              </Text>
            )}

            {/* Miembros / Participantes del Grupo */}
            {activity.participantes_grupo !== undefined && activity.participantes_grupo > 0 && (
              <Text fontSize="md" color="gray.600">
                👥 <strong>Miembros del Grupo Participantes:</strong> {activity.participantes_grupo}
              </Text>
            )}

            {/* Participantes Estimados */}
            {activity.participantes_estimados !== undefined && activity.participantes_estimados > 0 && (
              <Text fontSize="md" color="gray.600">
                🎯 <strong>Participantes Estimados:</strong> {activity.participantes_estimados}
              </Text>
            )}

            {/* Participantes Reales */}
            {activity.participantes_reales !== undefined && activity.participantes_reales > 0 && (
              <Text fontSize="md" color="gray.600">
                ✅ <strong>Participantes Reales:</strong> {activity.participantes_reales}
              </Text>
            )}
          </VStack>
        </Flex>

        <Divider />

        {/* Descripción */}
        <Box>
          <Heading size="lg" mb={4} color="primary">
            Descripción
          </Heading>

          <Text fontSize="lg" color="gray.700" whiteSpace="pre-line">
            {activity.descripcion}
          </Text>
        </Box>

        {/* Galería */}
        {showDriveGallery && (
          <Box>
            <Heading size="lg" mb={4} color="primary">
              Galería
            </Heading>

            {/* Galeria aqui */}
            
          </Box>
        )}

      </VStack>
    </Box>
  );
}
