"use client";

import React from "react";
import { VStack, Box, Link as ChakraLink } from "@chakra-ui/react";
import NextLink from "next/link";

export const AdminGroupNavbar = () => {
  const navItems = [
    { label: "Inicio", href: "/admingroup/dashboard" },
    { label: "Crear Actividad", href: "/admingroup/crear_actividad" },
    { label: "Nuestras Actividades", href: "/admingroup/nuestras_actividades" },
    { label: "Solicitudes", href: "/admingroup/solicitudes" },
  ];

  return (
    <Box
      w="250px"
      bg="secondary"
      color="white"
      p={6}
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
    >
      <VStack align="start" spacing={0}>
        {navItems.map((item, index) => (
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
