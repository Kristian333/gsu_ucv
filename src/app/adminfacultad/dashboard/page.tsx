"use client";

import React, { useEffect, useState } from "react";
import { VStack, Text, Heading, Divider, Box, Spinner, Center } from "@chakra-ui/react";
import { useAuth } from "@/app/context/auth-context";
import { apiRequest } from "@/components/formularios/api";

export default function FacultyDashboardPage() {
  const { user, isHydrated } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // CORRECCIÓN: Usar el nombre exacto de tu base de datos
  const roles = (user?.roles || []).map(r => r.toLowerCase());
  const isFaculty = roles.includes("faculty_admin");

  useEffect(() => {
    if (!isHydrated || !user?.id || !isFaculty) return;

    const fetchFacultyData = async () => {
      try {
        setLoading(true);
        const response = await apiRequest(`usuarios/${user.id}/dashboard`);
        setData(response);
      } catch (error) {
        console.error("Error cargando dashboard de facultad:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyData();
  }, [user?.id, isHydrated, isFaculty]);

  if (!isHydrated || loading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  // Si llegas aquí y no eres faculty_admin, ahora sí mostramos el error
  if (!isFaculty) {
    return (
      <Center h="50vh">
        <Text fontSize="lg" color="red.500">
          Error: Tu usuario no posee el rol 'faculty_admin'. 
          Roles detectados: {roles.join(", ")}
        </Text>
      </Center>
    );
  }

  return (
    <VStack spacing={12} align="center" justify="center" minH="70vh">
      <VStack spacing={4}>
        <Heading size="2xl" textAlign="center" color="blue.700">
          ¡Bienvenido al Panel de Facultad!
        </Heading>
        <Text fontSize="xl" color="gray.600">
          Gestionando: {user?.name}
        </Text>
      </VStack>

      <Box p={8} bg="blue.50" borderRadius="lg" w="full" maxW="600px" textAlign="center" shadow="sm">
        <Text fontWeight="bold" fontSize="lg">Información de Gestión</Text>
        <Text mt={2}>{data?.evento || "No hay eventos recientes para tu facultad."}</Text>
      </Box>
      
      <Box mt={12} w="100%" maxW="600px" p={8} bg="gray.100" borderRadius="lg" textAlign="center">
        <Text fontSize="lg" fontWeight="bold">Soporte Técnico DEU</Text>
        <Text mt={2}>📧 soporte@ucv.ve</Text>
        <Divider my={4} borderColor="gray.300" />
        <Text fontSize="sm">Caracas, UCV, Edif. Biblioteca Central, Piso 5</Text>
      </Box>
    </VStack>
  );
}