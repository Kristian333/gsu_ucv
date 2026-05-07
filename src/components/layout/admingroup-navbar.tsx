import React, { useEffect, useState } from "react";
import { VStack, Box, Link as ChakraLink } from "@chakra-ui/react";
import NextLink from "next/link";
import { useAuth } from "@/app/context/auth-context";
import { testLog } from "@/data/testLog";

// Función que lee el test.log simulado
function obtenerEstadoDesdeLog(userId, role) {
  const eventos = testLog.filter((l) => l.id === userId);
  if (eventos.length === 0) return null;

  // Si es un rol de grupo, buscamos su última validación de info
  if (role === "Grupo") {
    const info = eventos.filter((e) => e.evento === "GrupoInfoValida").pop();
    return info || null;
  }
  return eventos[eventos.length - 1];
}

export const AdminGroupNavbar = () => {
  const { user } = useAuth();
  const [estado, setEstado] = useState(null);


  const rolesArray = (user?.roles || []).map(r => r.toLowerCase().trim());
  const userId = user?.id || null;

  let role = "Invitado"; 
  if (rolesArray.includes('group_admin') || rolesArray.includes('group_helper')) {
    role = "Grupo";
  }
  // ---------------------------------------

  let infoAlDia = false;
  const GroupDash = role === "Grupo";

  useEffect(() => {
    if (!userId) return;
    const data = obtenerEstadoDesdeLog(userId, role);
    setEstado(data);
  }, [userId, role]);


  if (GroupDash && estado?.date) {
    const fecha = new Date(estado.date);
    const limite = new Date(fecha);
    limite.setFullYear(limite.getFullYear() + 1);

    if (new Date() <= limite) {
      infoAlDia = true;
    }
  }

 
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

  // Selección de items
  let navItems = (role === "Grupo" && infoAlDia) ? fullNavItems : invitadoNavItems;

  return (
    <Box
      w="250px"
      bg="primary" 
      color="white"
      p={6}
      display="flex"
      flexDirection="column"
      minH="100vh"
    >
      <VStack align="start" spacing={0} w="full">
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
    </Box>
  );
};