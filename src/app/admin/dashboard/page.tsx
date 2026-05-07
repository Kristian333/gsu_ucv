"use client";
import React, { useEffect, useState } from "react";
import { Box, Heading, Text, SimpleGrid, Spinner, Center } from '@chakra-ui/react';
import { useAuth } from "@/app/context/auth-context";
import { apiRequest } from "@/components/formularios/api";
import { DashboardCard } from '@/components/ui/dashboard-card';

export default function AdminDashboardPage() {
  const { user, isHydrated } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isHydrated || !user?.id) return;
    apiRequest(`usuarios/${user.id}/dashboard`)
      .then(res => setStats(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [user?.id, isHydrated]);

  if (!isHydrated || loading) return <Center h="60vh"><Spinner size="xl" color="blue.500" /></Center>;

  return (
    <Box maxW="container.xl" mx="auto" py={10} px={6}>
      <Heading as="h1" size="xl" color="gray.700">Panel de Administración</Heading>
      <Text mt={4} color="gray.600">Bienvenido, <b>{user?.name}</b>. Aquí tienes un resumen.</Text>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} mt={10}>
        <DashboardCard
          title="Gestión de Solicitudes"
          description="Revisa las solicitudes de organizaciones pendientes."
          count={stats?.solicitudes || 0} 
          countLabel="pendientes"
          link="/admin/solicitudes"
          linkText="Ir a Solicitudes"
        />
        <DashboardCard
          title="Gestión de Usuarios"
          description="Administra los usuarios y sus roles en la plataforma."
          count={stats?.verificaciones || 0}
          countLabel="por verificar"
          link="/admin/usuarios"
          linkText="Ir a Usuarios"
        />
      </SimpleGrid>
      
      <Box mt={12} p={5} bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" shadow="sm">
        <Text fontSize="sm" color="gray.500">Último evento: {stats?.evento || "Sin actividad"}</Text>
      </Box>
    </Box>
  );
}