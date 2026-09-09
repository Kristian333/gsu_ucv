// src/components/faculty/faculty-dashboard-client.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Spinner,
  Center,
  VStack,
  Divider,
} from "@chakra-ui/react";
import { useAuth } from "@/app/context/auth-context";
import { apiRequest } from "@/components/formularios/api";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { FacultyDashboardResponse } from "@/types/dashboard";

export function FacultyDashboardClient() {
  const { user, isHydrated } = useAuth();
  const [stats, setStats] = useState<FacultyDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const roles = (user?.roles || []).map((r) => r.toLowerCase());
  const isFaculty = roles.includes("faculty_admin");
  const facultyName = user?.facultad || "";

  useEffect(() => {
    if (!isHydrated || !isFaculty) return;

    // Se hace la petición usando el endpoint del dashboard de facultad
    apiRequest(`admin/group_dashboards/faculty/${encodeURIComponent(facultyName)}`)
      .then((res: FacultyDashboardResponse) => setStats(res))
      .catch((err) => console.error("Error al obtener dashboard de facultad:", err))
      .finally(() => setLoading(false));
  }, [isHydrated, isFaculty, facultyName]);

  if (!isHydrated || loading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" color="secondary.500" />
      </Center>
    );
  }

  if (!isFaculty) {
    return (
      <Center h="50vh">
        <Text fontSize="lg" color="red.500">
          Error: Tu usuario no posee el rol &apos;faculty_admin&apos;. Roles detectados: {roles.join(", ")}
        </Text>
      </Center>
    );
  }

  return (
    <Box maxW="container.xl" mx="auto" py={10} px={6}>
      <VStack spacing={2} align="center" mb={8}>
        <Heading size="2xl" textAlign="center" color="gray.700">
          ¡Bienvenido al Panel de Facultad!
        </Heading>
        <Text color="gray.600" fontSize="lg">
          Bienvenido, <b>Coordinador de {facultyName}</b>.
        </Text>
      </VStack>

      {/* Tarjetas de Métricas Principales */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
        <DashboardCard
          title="Solicitudes Pendientes"
          description="Revisiones de grupos de extensión pendientes por evaluación de la facultad."
          tags={[
            {
              count: stats?.solicitudes_pendientes ?? 0,
              label: "pendientes",
              colorScheme: "red",
            },
          ]}
          link="/adminfacultad/solicitudes"
          linkText="Ver solicitudes"
        />

        <DashboardCard
          title="Grupos de Extensión"
          description="Agrupaciones pertenecientes a esta facultad."
          tags={[
            {
              count: stats?.grupos_totales ?? 0,
              label: "registrados",
              colorScheme: "primary",
            },
          ]}
          link="/adminfacultad/grupos"
          linkText="Ver grupos"
        />
      </SimpleGrid>

      {/* Bloque de Soporte Técnico DEU */}
      <Box mt={12} mx="auto" maxW="600px" p={8} bg="gray.100" borderRadius="lg" textAlign="center">
        <Text fontSize="lg" fontWeight="bold">
          Soporte Técnico DEU
        </Text>
        <Text fontSize="md" mt={2}>
          📧 deu.depgsu@gmail.com
        </Text>
        <Text fontSize="md">📱 412-5502096</Text>
        <Divider my={4} borderColor="gray.300" />
        <Text fontSize="md" mt={2}>
          Caracas, UCV, Edif. Biblioteca Central, Piso 5
        </Text>
      </Box>
    </Box>
  );
}