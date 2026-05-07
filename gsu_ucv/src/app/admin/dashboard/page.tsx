// /app/admin/dashboard/page.tsx
import { Box, Heading, Text, Flex, SimpleGrid } from '@chakra-ui/react';
import { redirect } from 'next/navigation';
import { DashboardCard } from '@/components/ui/dashboard-card';

// Simulación: Obtener datos de solicitudes desde el servidor
async function getPendingRequests() {
  const pendingCount = 5; 
  return pendingCount;
}

// NUEVA FUNCIÓN: Obtener datos de cuentas no verificadas
async function getUnverifiedAccounts() {
  const unverifiedCount = 3; // Valor simulado
  return unverifiedCount;
}

// Simulación: Función de verificación de rol
async function checkAdminRole() {
  const user = { role: 'admin' };
  if (user.role !== 'admin') {
    redirect('/login?error=unauthorized');
  }
}

export default async function AdminDashboardPage() {
  await checkAdminRole();

  const pendingRequests = await getPendingRequests();
  const unverifiedAccounts = await getUnverifiedAccounts(); // Llamada a la nueva función

  return (
    <Box maxW="container.xl" mx="auto" py={10} px={6}>
      <Heading as="h1" size="xl">Panel de Administración</Heading>
      <Text mt={4}>Bienvenido, aquí tienes un resumen de las tareas pendientes.</Text>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} mt={10}>
        <DashboardCard
          title="Gestión de Solicitudes"
          description="Revisa las solicitudes de organizaciones pendientes."
          count={pendingRequests}
          countLabel="pendientes"
          link="/admin/solicitudes"
          linkText="Ir a Solicitudes"
        />
        <DashboardCard
          title="Gestión de Usuarios"
          description="Administra los usuarios y sus roles en la plataforma."
          count={unverifiedAccounts} // Pasamos el nuevo conteo aquí
          countLabel="por verificar" // Nueva etiqueta
          link="/admin/usuarios"
          linkText="Ir a Usuarios"
        />
      </SimpleGrid>
    </Box>
  );
}