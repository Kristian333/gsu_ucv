// /components/ui/group-dashboard-content.tsx
"use client";

import React, { useEffect, useState } from "react";
import { VStack, Button, Text, Heading, Divider, Box, Spinner, Center } from "@chakra-ui/react";
import NextLink from "next/link";
import { useAuth } from "@/app/context/auth-context";
import { apiRequest } from "@/components/formularios/api";

export function GroupDashboardContent() {
  const { user, isHydrated } = useAuth();
  const [miGrupo, setMiGrupo] = useState<any | null>(null);
  const [loadingGrupo, setLoadingGrupo] = useState<boolean>(true);
  const [infoAlDia, setInfoAlDia] = useState<boolean>(false);

  const rolesArray = (user?.roles || []).map(r => r.toLowerCase().trim());
  const GroupDash = rolesArray.includes("group_admin") || rolesArray.includes("group_helper");
  const VisitanteDash = rolesArray.includes("visitante");

  useEffect(() => {
    if (!isHydrated) return;

    // Si no cuenta con id de grupo (como un visitante nuevo), no hay nada que buscar en el backend
    if (!user?.groupId) {
      setLoadingGrupo(false);
      return;
    }

    async function cargarDetalleGrupo() {
      try {
        // 🔄 Contingencia:
        const dataGrupos = await apiRequest("groups?per_page=100", { method: "GET" });
        const lista = dataGrupos.grupos || dataGrupos.Groups || dataGrupos.groups || [];
        
        const grupoEncontrado = lista.find((g: any) => String(g.id) === String(user?.groupId));
        
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
        <>
          {mostrar.crearGrupo && (
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

          {mostrar.sinValidar && (
            <Text fontSize="xl" textAlign="center" color="orange.500" fontWeight="medium">
              Tu solicitud todavía está pendiente de revisión por la Dirección de Extensión.
            </Text>
          )}

          {mostrar.corregir && (
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
          )}

          {mostrar.validada && (
            <Text fontSize="xl" textAlign="center" color="green.600" fontWeight="semibold">
              Tu solicitud fue aceptada. Por favor, cierra sesión e ingresa con tus credenciales de Grupo de Extensión.
            </Text>
          )}
        </>
      )}
      
      {/* Sección Coordinadores de Grupo */}
      {GroupDash && (
        <>
          {mostrar.bienvenidaGrupo && (
            <Heading size="2xl" textAlign="center">
              ¡Bienvenido al panel de gestión de tu Grupo de Extensión!
            </Heading>
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