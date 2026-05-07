"use client";

import React, { useEffect, useState } from "react";
import { VStack, Box, Link as ChakraLink } from "@chakra-ui/react";
import NextLink from "next/link";
import { useAuth } from "@/app/context/auth-context";
import { testLog } from "@/data/testLog";

export const AdminFacultyNavbar = () => {
  const { user } = useAuth();
  const [estado, setEstado] = useState(null);

  const role = user?.role || null;
  const userId = user?.id || null;

  const FacultyDash = role === "Facultad";

  // Items disponibles
  const fullNavItems = [
    { label: "Inicio", href: "/adminfacultad/dashboard" },
    { label: "Solicitudes", href: "/adminfacultad/solicitudes" },
    { label: "Grupos", href: "/adminfacultad/grupos" },
  ];

  // Elección según rol
  let navItems = fullNavItems;

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
