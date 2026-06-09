"use client";

import React, { useEffect, useState } from "react";
import { VStack, Button, Text, Heading, Divider, Box } from "@chakra-ui/react";
import NextLink from "next/link";
import { useAuth } from "@/app/context/auth-context";

export default function DashboardPage() {
  const { user } = useAuth();
  const [estado, setEstado] = useState(null);

  const userRole = user?.role || null;
  const userId = user?.id || null;

  const FacultyDash = userRole === "Facultad";

  return (
    <VStack spacing={12} align="center" justify="center" minH="80vh">
      
      {/* Grupos */}
      {FacultyDash && (
        <Heading size="2xl" textAlign="center">
          ¡Bienvenido a la página de Facultades!
        </Heading>
      )}
      
      {/* Sección Contacto mejorada */}
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
        {/*<Heading size="lg" mb={4} color="primary">
          Información de Contacto
        </Heading>*/}
        <Text fontSize="lg">Para más información:</Text>
        <Text fontSize="md" mt={2}>📧 a@gmail.com</Text>
        <Text fontSize="md">📱 0414-1111111</Text>

        <Divider my={4} />

        <Text fontSize="lg">Dirección de Extensión:</Text>
        <Text fontSize="md" mt={2}>
          Caracas, UCV, Edif. Biblioteca Central, Piso 5
        </Text>
      </Box>
      
    </VStack>
  );
}
