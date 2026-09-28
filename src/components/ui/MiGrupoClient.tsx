"use client";

import { useEffect, useState, useCallback } from "react";
import { Box, Spinner, Text, Center, Heading, VStack } from "@chakra-ui/react";
import { useAuth } from "@/app/context/auth-context";
import { apiRequest } from "@/components/formularios/api";
import GrupoDetalle from "@/components/ui/GrupoDetalle";
import { GroupDetailBackend } from "@/types/group";

export default function MiGrupoClient() {
  const { user, isHydrated } = useAuth();
  const [grupo, setGrupo] = useState<GroupDetailBackend | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMiGrupo = useCallback(async (groupId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest(`/groups/${groupId}`);
      setGrupo(data || null);
    } catch (err) {
      console.error("Error al obtener la información de mi grupo:", err);
      setError("No se pudo cargar la información del grupo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const groupId = user?.groupId;

    if (groupId) {
      fetchMiGrupo(groupId);
    } else {
      setLoading(false);
    }
  }, [isHydrated, user?.groupId, fetchMiGrupo]);

  if (!isHydrated || loading) {
    return (
      <Center py={20}>
        <VStack spacing={4}>
          <Spinner size="xl" color="primary.500" thickness="4px" />
          <Text color="gray.500" fontSize="md">
            Cargando la información de tu grupo...
          </Text>
        </VStack>
      </Center>
    );
  }

  if (!user?.groupId) {
    return (
      <Box p={10} textAlign="center">
        <Heading size="lg" color="gray.700">
          Sin grupo asignado
        </Heading>
        <Text mt={4} color="gray.500">
          No tienes un ID de grupo asociado a tu usuario actual.
        </Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={10} textAlign="center">
        <Heading size="lg" color="red.500">
          Ocurrió un error
        </Heading>
        <Text mt={4} color="gray.500">
          {error}
        </Text>
      </Box>
    );
  }

  return <GrupoDetalle grupo={grupo} />;
}