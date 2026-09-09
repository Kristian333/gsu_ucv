// src/components/ui/actividad.tsx
"use client";

import React, { useState } from "react";
import { 
  Box,
  Flex,
  Heading,
  Text,
  Image,
  VStack,
  Divider,
  Link as ChakraLink,
  IconButton,
  useToast,
  Tooltip
} from "@chakra-ui/react";
import NextLink from "next/link";
import { StarIcon } from "@chakra-ui/icons";
import { formatActivityDateRange } from "@/utils/common";
import { useAuth } from "@/app/context/auth-context";
import { apiRequest } from "@/components/formularios/api";

interface ActivityBackend {
  id: string;
  group_id: string;
  nombre_grupo?: string;
  nombre: string;
  descripcion: string;
  fecha_inicio?: string;
  fecha_fin?: string;
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
  destacado?: boolean;
}

interface Props {
  activityId: string;
  activity: ActivityBackend | null;
}

export default function ActivityClientPage({ activityId, activity }: Props) {
  const placeholderImage = "/imagen-no-disponible.jpg";
  const toast = useToast();
  const { user } = useAuth();

  const [isFeatured, setIsFeatured] = useState<boolean>(activity?.destacado ?? false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Actividad no Encontrada
  if (!activity) {
    return (
      <Box maxW="4xl" mx="auto" p={10} textAlign="center">
        <Heading size="lg">Actividad no encontrada</Heading>
        <Text mt={4}>No existe una actividad con el ID {activityId}.</Text>
      </Box>
    );
  }

  // Verificar si el usuario autenticado pertenece al grupo de la actividad y tiene rol de grupo
  const rolesArray = (user?.roles || []).map(r => r.toLowerCase().trim());
  const isGroupOwner =
    rolesArray.includes("group_admin") && String(user?.groupId) === String(activity.group_id);

  // Handler para conmutar el estado de destacado
  const handleToggleFeature = async () => {
    setIsLoading(true);
    const newFeaturedState = !isFeatured;

    try {
      await apiRequest("/activities/feature", {
        method: "PATCH",
        body: JSON.stringify({
          id: activity.id,
          is_featured: newFeaturedState,
        }),
      });

      setIsFeatured(newFeaturedState);
      toast({
        title: "Éxito",
        description: newFeaturedState
          ? "Actividad destacada correctamente"
          : "Actividad quitada de destacadas",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } catch (err: any) {
      toast({
        title: "Atención",
        description: err.message || "No se pudo actualizar el estado de destacada",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const finalImageUrl = activity.cubierta && activity.cubierta.trim() !== "" 
    ? activity.cubierta 
    : placeholderImage;

  // Formatear la fecha
  const rawStart = activity.fecha_inicio || "";
  const rawEnd = activity.fecha_fin || activity.fecha_inicio || "";
  const fechaFormateada = formatActivityDateRange(rawStart, rawEnd);

  // Lógica para la galería
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
          <VStack align="start" spacing={3} flex="1" alignItems="center" pos="relative" pt={isGroupOwner ? 8 : 0}>
            {/* Estrella de Destacado solo visible para el grupo */}
            {isGroupOwner && (
              <Box pos="absolute" top={0} right={0}>
                <Tooltip
                  label={isFeatured ? "Quitar de destacadas" : "Marcar como destacada"}
                  placement="top"
                >
                  <IconButton
                    aria-label="Destacar actividad"
                    icon={<StarIcon color={isFeatured ? "yellow.400" : "gray.300"} />}
                    variant="ghost"
                    fontSize="2xl"
                    isLoading={isLoading}
                    onClick={handleToggleFeature}
                    _hover={{ transform: "scale(1.2)" }}
                    transition="all 0.2s"
                  />
                </Tooltip>
              </Box>
            )}

            {/* Título */}
            <Heading size="2xl" color="primary" textAlign="center">
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
            {fechaFormateada && (
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

            {/* Galería */}
            
          </Box>
        )}
      </VStack>
    </Box>
  );
}
