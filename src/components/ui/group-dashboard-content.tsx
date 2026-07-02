"use client";

import React, { useEffect, useState } from "react";
import { VStack, Button, Text, Heading, Divider, Box, Spinner, Center } from "@chakra-ui/react";
import NextLink from "next/link";
import { useAuth } from "@/app/context/auth-context";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface GroupDashboardContentProps {
  miGrupo: any | null;
}

export function GroupDashboardContent({ miGrupo }: GroupDashboardContentProps) {
  const { user, isHydrated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [infoAlDia, setInfoAlDia] = useState<boolean>(false);

  const rolesArray = (user?.roles || []).map(r => r.toLowerCase().trim());
  const userIdStr = user?.id || null;

  const GroupDash = rolesArray.includes("group_admin") || rolesArray.includes("group_helper");
  const VisitanteDash = rolesArray.includes("visitante");

  // Sincronizar el ID del usuario con la URL para disparar el renderizado del Servidor
  useEffect(() => {
    if (!isHydrated || !userIdStr) return;

    if (searchParams.get("userId") !== userIdStr) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("userId", userIdStr);
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [userIdStr, isHydrated, searchParams, pathname, router]);

  // Verificar vigencia anual si el servidor consiguió el grupo
  useEffect(() => {
    if (miGrupo?.actualizado_en) {
      const fechaActualizacion = new Date(miGrupo.actualizado_en);
      const fechaLimite = new Date(fechaActualizacion);
      fechaLimite.setFullYear(fechaLimite.getFullYear() + 1);

      const hoy = new Date();
      setInfoAlDia(hoy < fechaLimite);
    }
  }, [miGrupo]);

  // Spinner limpio mientras se lee el localStorage o el servidor actualiza la query
  if (!isHydrated || (userIdStr && !miGrupo && searchParams.get("userId") !== userIdStr)) {
    return (
      <Center minH="80vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="green.500" thickness="4px" />
          <Text fontSize="lg" color="gray.500">Cargando tu panel de control...</Text>
        </VStack>
      </Center>
    );
  }

  // Banderas visuales simplificadas basadas en datos limpios
  const mostrar = {
    crearGrupo: VisitanteDash && !miGrupo,
    sinValidar: VisitanteDash && miGrupo && !miGrupo.activo,
    corregir: false, // Disponible para lógica de observaciones futuras
    validada: VisitanteDash && miGrupo && miGrupo.activo,
    bienvenidaGrupo: GroupDash && infoAlDia,
    validarGrupo: GroupDash && !infoAlDia,
    rechazada: false, // Por si se implementa una bandera de rechazo explícita
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