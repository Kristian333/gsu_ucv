import { Box, Heading, Text } from '@chakra-ui/react';
import { redirect } from 'next/navigation';
import { Metadata } from "next";
import { SolicitudesTable } from '@/components/ui/solicitudes-table';

async function checkAdminRole() {
  const user = { role: 'admin' };
  if (user.role !== 'admin') {
    redirect('/login?error=unauthorized');
  }
}

export const metadata: Metadata = {
  title: "Gestión de Solicitudes | GSU",
  description: "Administración de solicitudes de grupos de extensión y recursos.",
};

export default async function SolicitudesPage() {
  await checkAdminRole();

  return (
    <Box maxW="container.xl" mx="auto" py={10} px={6}>
      <Heading as="h1" size="xl" mb={2}>Gestión de Solicitudes</Heading>
      <Text fontSize="lg" color="gray.500" mb={8}>
        Administra las solicitudes de registro y peticiones de recursos de los Grupos de Extensión.
      </Text>
      
      {/* Componente cliente con la lógica dinámica */}
      <SolicitudesTable />
    </Box>
  );
}