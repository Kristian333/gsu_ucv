// /components/layout/admingroup-navbar.tsx
"use client";

import React, { useEffect, useState } from "react";
import { VStack, Box, Link as ChakraLink, Text, SkeletonText } from "@chakra-ui/react";
import NextLink from "next/link";
import { useAuth } from "@/app/context/auth-context";
import { apiRequest } from "@/components/formularios/api";

export const AdminGroupNavbar = () => {
  const { user, isHydrated } = useAuth();
  const [infoAlDia, setInfoAlDia] = useState<boolean>(false);
  const [nombreGrupo, setNombreGrupo] = useState<string>("Buscando grupo...");
  const [loading, setLoading] = useState<boolean>(true);

  const rolesArray = (user?.roles || []).map(r => r.toLowerCase().trim());
  const esVisitante = rolesArray.includes("visitante");

  useEffect(() => {
    if (!isHydrated) return;

    if (!user?.groupId) {
      setInfoAlDia(false);
      setNombreGrupo(esVisitante ? "Aplicante de Grupo" : "Sin Grupo Asociado");
      setLoading(false);
      return;
    }

    async function verificarVigenciaGrupo() {
      try {
        // 🔄 Contingencia:
        const dataGrupos = await apiRequest("groups?per_page=100", { method: "GET" });
        const lista = dataGrupos.grupos || dataGrupos.Groups || dataGrupos.groups || [];
        
        const miGrupo = lista.find((g: any) => String(g.id) === String(user?.groupId));
        
        if (miGrupo) {
          setNombreGrupo(miGrupo.nombre);

          const fechaRaw = miGrupo.actualizado_en;
          if (fechaRaw) {
            const fechaActualizacion = new Date(fechaRaw);
            const fechaLimite = new Date(fechaActualizacion);
            fechaLimite.setFullYear(fechaLimite.getFullYear() + 1);

            const hoy = new Date();
            setInfoAlDia(hoy < fechaLimite);
          } else {
            setInfoAlDia(false);
          }
        }
      } catch (error) {
        console.error("Error validando vigencia del grupo:", error);
        setNombreGrupo("Error de conexión");
        setInfoAlDia(false);
      } finally {
        setLoading(false);
      }
    }

    verificarVigenciaGrupo();
  }, [user?.groupId, isHydrated, esVisitante]);

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
  
  const navItems = (infoAlDia && !esVisitante) ? fullNavItems : invitadoNavItems;

  if (loading || !isHydrated) {
    return (
      <Box w="250px" bg="primary" p={6} minH="100vh">
        <SkeletonText mt="4" noOfLines={4} spacing="4" skeletonHeight="2" />
      </Box>
    );
  }

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

      <Box pt={4} borderTop="2px dashed rgba(255,255,255,0.3)">
        <Text fontSize="xs" color="gray.300" textTransform="uppercase" letterSpacing="wider">
          Grupo:
        </Text>
        <Text fontSize="md" fontWeight="black" color="teal.200" noOfLines={1}>
          {nombreGrupo}
        </Text>
        <Text fontSize="xx-small" color={infoAlDia ? "green.300" : "orange.300"} mt={1}>
          ● {infoAlDia ? "Información al día" : "Actualización requerida"}
        </Text>
      </Box>
    </Box>
  );
};