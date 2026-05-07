"use client";

import React, { useEffect, useState } from "react";
import { VStack, Box, Link as ChakraLink } from "@chakra-ui/react";
import NextLink from "next/link";
import { useAuth } from "@/app/context/auth-context";
import { testLog } from "@/data/testLog";

// Función temporal que lee el test.log simulado
function obtenerEstadoDesdeLog(userId, role) {
  // Simulación temporal:
  // En producción esto vendrá de backend.
  const eventos = testLog.filter((l) => l.id === userId);
  if (eventos.length === 0) return null;

  const ultimo = eventos[eventos.length - 1];

  if (role === "Grupo") {
    const info = eventos.filter((e) => e.evento === "GrupoInfoValida").pop();
    return info || null;
  }

  return ultimo;
}

export const AdminGroupNavbar = () => {
  const { user } = useAuth();
  const [estado, setEstado] = useState(null);

  const role = user?.role || null;
  const userId = user?.id || null;

  var infoAlDia
  const GroupDash = role === "Grupo";

  useEffect(() => {
    if (!userId) return;
    const data = obtenerEstadoDesdeLog(userId, role);
    setEstado(data);
  }, [userId, role]);

  // Por ahora: los grupos siempre tienen "info al día"
  if (GroupDash) {
    const fecha = new Date(estado?.date);
    const limite = new Date(fecha);
    limite.setFullYear(limite.getFullYear() + 1);

    if (new Date() <= limite) {
      infoAlDia = true
    } else {
      infoAlDia = false
    }
  }
  ;

  // Items disponibles para grupos
  const fullNavItems = [
    { label: "Inicio", href: "/admingroup/dashboard" },
    { label: "Planificar Actividad", href: "/admingroup/crear_actividad" },
    { label: "Nuestras Actividades", href: "/admingroup/nuestras_actividades" },
    { label: "Solicitudes", href: "/admingroup/solicitudes" },
    { label: "Estadisticas", href: "/admingroup/estadisticas" },
  ];

  // Invitado: solo Inicio
  const invitadoNavItems = [
    { label: "Inicio", href: "/admingroup/dashboard" },
  ];

  // Elección según rol
  let navItems = [];

  if (role === "Invitado") {
    navItems = invitadoNavItems;
  } else if (role === "Grupo") {
    navItems = infoAlDia ? fullNavItems : invitadoNavItems;
  }

  return (
    <Box
      w="250px"
      bg="primary"
      color="white"
      p={6}
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
    >
      <VStack align="start" spacing={0}>
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

            {/* Borde de separación excepto en el último */}
            
            <Box borderBottom="1px solid rgba(255,255,255,0.4)"/>
            
          </Box>
        ))}
      </VStack>
    </Box>
  );
};
