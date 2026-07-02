"use client";

import React, { useEffect, useState } from "react";
import { VStack, Box, Link as ChakraLink, Text, SkeletonText } from "@chakra-ui/react";
import NextLink from "next/link";
import { useAuth } from "@/app/context/auth-context";
import { apiRequest } from "@/components/formularios/api";

interface GroupData {
  id: any; 
  nombre: string;
  descripcion: string;
  propietario: {
    id: any;  
  };
  ubicacion: string;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
}

export const AdminGroupNavbar = () => {
  const { user, isHydrated } = useAuth();
  const [infoAlDia, setInfoAlDia] = useState<boolean>(false);
  const [nombreGrupo, setNombreGrupo] = useState<string>("Buscando grupo...");
  const [loading, setLoading] = useState<boolean>(true);

  const rolesArray = (user?.roles || []).map(r => r.toLowerCase().trim());
  const userIdStr = user?.id || null;
  const esGrupo = rolesArray.includes('group_admin') || rolesArray.includes('group_helper');

  useEffect(() => {
    if (!isHydrated) return;

    if (!userIdStr || !esGrupo) {
      setInfoAlDia(false);
      setNombreGrupo("Sin Rol de Grupo");
      setLoading(false);
      return;
    }

    async function verificarVigenciaGrupo() {
      try {
        // Hacemos el llamado controlado
        const data = await apiRequest("groups?per_page=100", { method: "GET" });
        const listaGrupos: GroupData[] = data.grupos || data.Groups || [];

        const miGrupo = listaGrupos.find(g => 
          g.propietario && String(g.propietario.id).trim() === String(userIdStr).trim()
        );
        
        if (miGrupo) {
          setNombreGrupo(miGrupo.nombre);

          if (miGrupo.actualizado_en) {
            const fechaActualizacion = new Date(miGrupo.actualizado_en);
            const fechaLimite = new Date(fechaActualizacion);
            fechaLimite.setFullYear(fechaLimite.getFullYear() + 1);

            const hoy = new Date();
            setInfoAlDia(hoy < fechaLimite);
          } else {
            setInfoAlDia(false);
          }
        } else {
          setNombreGrupo("Grupo no asociado");
          setInfoAlDia(false);
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
  }, [userIdStr, esGrupo, isHydrated]);

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

  if (loading || !isHydrated) {
    return (
      <Box w="250px" bg="primary" p={6} minH="100vh">
        <SkeletonText mt="4" noOfLines={4} spacing="4" skeletonHeight="2" />
      </Box>
    );
  }

  const navItems = infoAlDia ? fullNavItems : invitadoNavItems;

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