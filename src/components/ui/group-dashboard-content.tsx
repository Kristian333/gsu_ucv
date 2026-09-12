// /components/ui/group-dashboard-content.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  VStack,
  Button,
  Text,
  Heading,
  Divider,
  Box,
  Spinner,
  Center,
  SimpleGrid,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useAuth } from "@/app/context/auth-context";
import { apiRequest } from "@/components/formularios/api";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { ContactSupportCard } from "@/components/ui/contact-support-card";
import { GroupDashboardResponse } from "@/types/dashboard";

export function GroupDashboardContent() {
  const { user, isHydrated } = useAuth();
  const [metrics, setMetrics] = useState<GroupDashboardResponse | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState<boolean>(true);

  const rolesArray = (user?.roles || []).map((r) => r.toLowerCase().trim());
  const GroupDash = rolesArray.includes("group_admin") || rolesArray.includes("group_helper");
  const VisitanteDash = rolesArray.includes("visitante");

  // Validación de la fecha de actualización del grupo
  let infoAlDia = false;
  if (user?.groupUpdatedAt) {
    const fechaActualizacion = new Date(user.groupUpdatedAt);
    const fechaLimite = new Date(fechaActualizacion);
    fechaLimite.setFullYear(fechaLimite.getFullYear() + 1);

    const hoy = new Date();
    infoAlDia = hoy < fechaLimite;
  }

  const esGrupoActivo = Boolean(user?.groupActive);
  const tieneGrupoAsociado = Boolean(user?.groupId);

  useEffect(() => {
    if (!isHydrated) return;

    if (!user?.groupId || !esGrupoActivo || !infoAlDia) {
      setLoadingMetrics(false);
      return;
    }

    async function cargarMetricas() {
      try {
        const metricsData: GroupDashboardResponse = await apiRequest(
          `groups/${user?.groupId}/dashboard`,
          { method: "GET" }
        );
        setMetrics(metricsData);
      } catch (error) {
        console.error("Error obteniendo métricas del grupo:", error);
      } finally {
        setLoadingMetrics(false);
      }
    }

    cargarMetricas();
  }, [user?.groupId, esGrupoActivo, infoAlDia, isHydrated]);

  if (!isHydrated || (GroupDash && loadingMetrics)) {
    return (
      <Center minH="80vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="green.500" thickness="4px" />
          <Text fontSize="lg" color="gray.500">Cargando tu panel de control...</Text>
        </VStack>
      </Center>
    );
  }

  const mostrar = {
    crearGrupo: VisitanteDash && !tieneGrupoAsociado,
    sinValidar: VisitanteDash && tieneGrupoAsociado && !esGrupoActivo,
    validada: VisitanteDash && tieneGrupoAsociado && esGrupoActivo,
    bienvenidaGrupo: GroupDash && infoAlDia && esGrupoActivo,
    validarGrupo: GroupDash && !infoAlDia && esGrupoActivo,
    grupoInactivo: GroupDash && !esGrupoActivo,
  };

  return (
    <VStack spacing={12} align="center" justify="center" minH="80vh" w="full" px={4} py={10}>
      
      {/* Sección Visitantes */}
      {VisitanteDash && (
        <VStack spacing={4}>
          <Text fontSize="xl" textAlign="center">
            ¡Realiza una solicitud para crear tu Grupo de Extensión en el sistema!
          </Text>
          <NextLink href="/admingroup/crear_grupo" passHref>
            <Button background="teal.500" color="white" size="lg" _hover={{ bg: "teal.600" }}>
              ¡Crea tu grupo de extensión!
            </Button>
          </NextLink>
        </VStack>
      )}
      
      {/* Sección Coordinadores de Grupo */}
      {GroupDash && (
        <>
          {mostrar.bienvenidaGrupo && (
            <VStack spacing={8} w="full" maxW="container.xl">
              <Heading size="2xl" textAlign="center">
                ¡Bienvenido al panel de gestión de tu Grupo de Extensión!
              </Heading>

              {/* Métrica / Tarjetas usando DashboardCard */}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} w="full">
                <DashboardCard
                  title="Actividades Futuras"
                  description="Actividades programadas por el grupo pendientes de ejecución."
                  tags={[
                    {
                      count: metrics?.actividades_futuras ?? 0,
                      label: "programadas",
                      colorScheme: "blue",
                    },
                  ]}
                  link="/admingroup/nuestras_actividades?estado=proximamente&page=1"
                  linkText="Ver actividades"
                />

                <DashboardCard
                  title="Reportes Pendientes"
                  description="Reportes de actividades finalizadas pendientes por enviar o completar."
                  tags={[
                    {
                      count: metrics?.reportes_pendientes ?? 0,
                      label: "pendientes",
                      colorScheme: "orange",
                    },
                  ]}
                  link="/admingroup/nuestras_actividades?page=1&estado=espera_reporte"
                  linkText="Ver reportes"
                />
              </SimpleGrid>
            </VStack>
          )}

          {mostrar.validarGrupo && (
            <VStack spacing={4}>
              <Text fontSize="xl" textAlign="center" fontWeight="medium">
                ¡Atención! Necesitas actualizar y validar la información anual de tu Grupo de Extensión.
              </Text>
              <NextLink href="/admingroup/validar_grupo" passHref>
                <Button background="primary" color="white" size="lg">
                  Validar información
                </Button>
              </NextLink>
            </VStack>
          )}

          {mostrar.grupoInactivo && (
            <VStack spacing={4} maxW="600px" textAlign="center">
              <Text fontSize="xl" fontWeight="semibold" color="red.600">
                El grupo no está activo actualmente. Por favor comunicarse con la DEU mediante los contactos provistos abajo.
              </Text>
            </VStack>
          )}
          
          {/*{mostrar.corregir && (
            <VStack spacing={4}>
              <Text fontSize="xl" textAlign="center">
                Tu solicitud ha sido revisada, pero necesita correcciones.
              </Text>
              <NextLink href="/admingroup/corregir_solicitud" passHref>
                <Button colorScheme="orange" size="lg">
                  Corregir solicitud
                </Button>
              </NextLink>
            </VStack>
          )}*/}
        </>
      )}
      
      {/* Tarjeta de Contacto Estática Fija */}
      <ContactSupportCard title="Para más información:" />
      
    </VStack>
  );
}