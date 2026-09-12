// /components/layout/admingroup-navbar.tsx
"use client";

import React from "react";
import { VStack, Box, Link as ChakraLink, Text, SkeletonText } from "@chakra-ui/react";
import NextLink from "next/link";
import { useAuth } from "@/app/context/auth-context";

export const AdminGroupNavbar = () => {
  const { user, isHydrated } = useAuth();

  if (!isHydrated) {
    return (
      <Box w="250px" bg="primary" p={6} minH="100vh">
        <SkeletonText mt="4" noOfLines={4} spacing="4" skeletonHeight="2" />
      </Box>
    );
  }

  const rolesArray = (user?.roles || []).map((r) => r.toLowerCase().trim());
  const esGrupo = rolesArray.includes("group_admin") || rolesArray.includes("group_helper");
  const esVisitante = rolesArray.includes("visitante");

  let infoAlDia = false;
  if (user?.groupUpdatedAt) {
    const fechaActualizacion = new Date(user.groupUpdatedAt);
    const fechaLimite = new Date(fechaActualizacion);
    fechaLimite.setFullYear(fechaLimite.getFullYear() + 1);

    const hoy = new Date();
    infoAlDia = hoy < fechaLimite;
  }

  const esGrupoActivo = Boolean(user?.groupActive);
  const nombreGrupo = user?.group || (esVisitante ? "Aplicante de Grupo" : "Sin Grupo Asociado");

  const fullNavItems = [
    { label: "Inicio", href: "/admingroup/dashboard" },
    { label: "Planificar Actividad", href: "/admingroup/crear_actividad" },
    { label: "Nuestras Actividades", href: "/admingroup/nuestras_actividades" },
    { label: "Solicitudes", href: "/admingroup/solicitudes" },
    { label: "Estadísticas", href: "/admingroup/estadisticas" },
  ];

  const invitadoNavItems = [
    { label: "Inicio", href: "/admingroup/dashboard" },
  ];

  const navItems = (infoAlDia && esGrupoActivo && !esVisitante) ? fullNavItems : invitadoNavItems;

  return (
    <Box
      w="250px"
      bg="primary"
      color="white"
      p={6}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minH="100vh"
    >
      <VStack align="start" spacing={0} w="full" flex="1">
        {navItems.map((item) => (
          <Box key={item.href} w="full">
            <ChakraLink
              as={NextLink}
              href={item.href}
              display="block"
              py={3}
              fontWeight="bold"
              px={2}
              _hover={{ textDecoration: "none", bg: "teal.500" }}
            >
              {item.label}
            </ChakraLink>
            <Box borderBottom="1px solid rgba(255,255,255,0.4)" />
          </Box>
        ))}
      </VStack>

      {esGrupo && (
        <Box pt={4} borderTop="2px dashed rgba(255,255,255,0.3)">
          <Text fontSize="xs" color="gray.300" textTransform="uppercase" letterSpacing="wider">
            Grupo:
          </Text>
          <Text fontSize="md" fontWeight="black" color="teal.200" noOfLines={1}>
            {nombreGrupo}
          </Text>
          <Text fontSize="xx-small" color={(infoAlDia && esGrupoActivo) ? "green.300" : "orange.300"} mt={1}>
            ● {!esGrupoActivo
                ? "Grupo Inactivo" 
                : (infoAlDia ? "Información al día" : "Actualización requerida")}
          </Text>
        </Box>
      )}
    </Box>
  );
};