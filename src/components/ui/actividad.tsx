// src/components/ui/actividad.tsx
"use client";

import React from "react";
import { Box, Flex, Heading, Text, Image, VStack, Divider, Link as ChakraLink } from "@chakra-ui/react";
import NextLink from "next/link";

interface ActivityFile {
  id: string;
  nombre: string;
  url: string;
  proposito: string;
}

interface ActivityBackend {
  id: string;
  group_id: string;
  nombre: string;
  descripcion: string;
  fecha: string;
  area_conocimiento: string;
  aliados?: string;
  participantes_estimados?: number;
  participantes_reales?: number;
  financiamiento?: string;
  observaciones?: string;
  archivos?: ActivityFile[];
}

interface LinkedGroup {
  id: string;
  title: string;
}

interface Props {
  activityId: string;
  activity: ActivityBackend | null;
  linkedGroup: LinkedGroup | null;
}

// Función auxiliar para transformar la fecha "2025-12-03T00:00:00Z" -> "03/12/2025"
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

export default function ActivityClientPage({ activityId, activity, linkedGroup }: Props) {
  const placeholderImage = "https://placehold.co/450x300/cccccc/ffffff/png?text=Imagen+Principal+no+encontrada";

  // Actividad no Encontrada
  if (!activity) {
    return (
      <Box maxW="4xl" mx="auto" p={10} textAlign="center">
        <Heading size="lg">Actividad no encontrada</Heading>
        <Text mt={4}>No existe una actividad con el ID {activityId}.</Text>
      </Box>
    );
  }

  // Buscar la imagen cuyo propósito sea "Imagen Princpal" (o fallback si no se ha renombrado en tu BD aún)
  const mainImageFile = activity.archivos?.find(
    (f) => f.proposito === "Imagen Princpal" || f.proposito === "background"
  );
  const finalImageUrl = mainImageFile ? mainImageFile.url : placeholderImage;

  // Formatear la fecha única del backend
  const fechaFormateada = formatBackendDate(activity.fecha);

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

            {/* Enlace o Fallback del Grupo */}
              <Text fontSize="xl" color="gray.600">
                <strong>Grupo:</strong>{" "}
                {linkedGroup ? (
                  <ChakraLink
                    as={NextLink}
                    href={`/grupo/${linkedGroup.id}`}
                    color="primary"
                    _hover={{ textDecoration: "underline", color: "primary.600" }}
                  >
                    {linkedGroup.title}
                  </ChakraLink>
                ) : (
                <Text as="span" color="red.400" fontStyle="italic">
                  (Grupo no disponible temporalmente)
                </Text>
              )}
            </Text>

            {/* Fecha formateada en base a un solo campo */}
            {activity.fecha && (
              <Text fontSize="lg" color="gray.500">
                📅 Fecha: {fechaFormateada}
              </Text>
            )}

            {/* Campo Área de Conocimiento */}
            {activity.area_conocimiento && (
              <Text fontSize="lg" color="gray.500">
                Actividad: {activity.area_conocimiento}
              </Text>
            )}

            {/* Campos adicionales condicionales (uno abajo del otro) */}
            {activity.aliados && activity.aliados.trim() !== "" && (
              <Text fontSize="md" color="gray.600">
                <strong>Aliados:</strong> {activity.aliados}
              </Text>
            )}

            {activity.participantes_estimados !== undefined && activity.participantes_estimados > 0 && (
              <Text fontSize="md" color="gray.600">
                <strong>Participantes Estimados:</strong> {activity.participantes_estimados}
              </Text>
            )}

            {activity.participantes_reales !== undefined && activity.participantes_reales > 0 && (
              <Text fontSize="md" color="gray.600">
                <strong>Participantes Reales:</strong> {activity.participantes_reales}
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

          <Text fontSize="lg" color="gray.700">
            {activity.descripcion}
          </Text>
        </Box>

        {/* Galería */}
        <Box>
          <Heading size="lg" mb={4} color="primary">
            Galería
          </Heading>

          {/* Galeria aqui */}

        </Box>

      </VStack>
    </Box>
  );
}
