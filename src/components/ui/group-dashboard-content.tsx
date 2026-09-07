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
import { GroupDashboardResponse } from "@/types/dashboard";

export function GroupDashboardContent() {
  const { user, isHydrated } = useAuth();
  const [miGrupo, setMiGrupo] = useState<any | null>(null);
  const [metrics, setMetrics] = useState<GroupDashboardResponse | null>(null);
  const [loadingGrupo, setLoadingGrupo] = useState<boolean>(true);
  const [infoAlDia, setInfoAlDia] = useState<boolean>(false);

  const rolesArray = (user?.roles || []).map((r) => r.toLowerCase().trim());
  const GroupDash = rolesArray.includes("group_admin") || rolesArray.includes("group_helper");
  const VisitanteDash = rolesArray.includes("visitante");

  useEffect(() => {
    if (!isHydrated) return;

    const groupId = user?.groupId;
    
    if (!groupId) {
      setLoadingGrupo(false);
      return;
    }

    async function cargarDetalleGrupo() {
      try {
        // 🔄 Contingencia:
        const dataGrupos = await apiRequest("groups?per_page=100", { method: "GET" });
        const lista = dataGrupos.grupos || dataGrupos.Groups || dataGrupos.groups || [];
        
        const grupoEncontrado = lista.find((g: any) => String(g.id) === String(groupId));
        
        if (grupoEncontrado) {
          setMiGrupo(grupoEncontrado);
          
          const fechaRaw = grupoEncontrado.actualizado_en;
          if (fechaRaw) {
            const fechaActualizacion = new Date(fechaRaw);
            const fechaLimite = new Date(fechaActualizacion);
            fechaLimite.setFullYear(fechaLimite.getFullYear() + 1);

            const hoy = new Date();
            setInfoAlDia(hoy < fechaLimite);
          }
        }

        const metricsData: GroupDashboardResponse = await apiRequest(
          `groups/${groupId}/dashboard`,
          { method: "GET" }
        );
        setMetrics(metricsData);
      } catch (error) {
        console.error("Error obteniendo detalles del grupo en dashboard:", error);
      } finally {
        setLoadingGrupo(false);
      }
    }

    cargarDetalleGrupo();
  }, [user?.groupId, isHydrated]);

  if (!isHydrated || loadingGrupo) {
    return (
      <Center minH="80vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="green.500" thickness="4px" />
          <Text fontSize="lg" color="gray.500">Cargando tu panel de control...</Text>
        </VStack>
      </Center>
    );
  }

  const esGrupoActivo = miGrupo ? ( miGrupo.activo ?? false) : false;

  const mostrar = {
    crearGrupo: VisitanteDash && !miGrupo,
    sinValidar: VisitanteDash && miGrupo && !esGrupoActivo,
    corregir: false,
    validada: VisitanteDash && miGrupo && esGrupoActivo,
    bienvenidaGrupo: GroupDash && infoAlDia,
    validarGrupo: GroupDash && !infoAlDia,
    rechazada: false,
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
              <Text fontSize="xl" textAlign="center">
                ¡Atención! Necesitas actualizar y validar la información anual de tu Grupo de Extensión.
              </Text>
              <NextLink href="/admingroup/validar_grupo" passHref>
                <Button background="primary" color="white" size="lg">
                  Validar información
                </Button>
              </NextLink>
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
      <Box
        mt={12}
        w="100%"
        maxW="600px"
        p={8}
        bg="gray.100"
        borderRadius="lg"
        boxShadow="md"
        textAlign="center"
      >
        <Text fontSize="lg">Para más información:</Text>
        <Text fontSize="md" mt={2}>📧 deu.depgsu@gmail.com</Text>
        <Text fontSize="md">📱 412-5502096</Text>

        <Divider my={4} />

        <Text fontSize="lg">Dirección de Extensión:</Text>
        <Text fontSize="md" mt={2}>
        Caracas, UCV, Edif. Biblioteca Central, Piso 5
        </Text>
      </Box>
      
    </VStack>
  );
}