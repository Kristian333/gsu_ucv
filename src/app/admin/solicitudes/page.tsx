import { Box, Heading, Text } from '@chakra-ui/react';
import { redirect } from 'next/navigation';
import { SolicitudesTable } from '@/components/ui/solicitudes-table';

// Simulación: Obtener solicitudes de Grupo de Extensión
async function getGrupoExtensionSolicitudes() {
  const data = [
    { id: 'sol-101', tipo: 'Solicitud de Creacion de Grupo', fecha: '2023-10-23', estado: 'Pendiente', nombre: 'Grupo de Extensión X' },
    { id: 'sol-102', tipo: 'Solicitud de Recurso', fecha: '2023-10-22', estado: 'Pendiente', nombre: 'Grupo de Extensión Y' },
  ];
  return data;
}

// Lógica de seguridad para verificar el rol
async function checkAdminRole() {
  const user = { role: 'admin' };
  if (user.role !== 'admin') {
    redirect('/login?error=unauthorized');
  }
}

export default async function SolicitudesPage() {
  await checkAdminRole();

  const grupoExtension = await getGrupoExtensionSolicitudes();

  return (
    <Box maxW="container.xl" mx="auto" py={10} px={6}>
      <Heading as="h1" size="xl" mb={4}>Gestión de Solicitudes</Heading>
      <Text fontSize="lg" color="gray.500" mb={8}>
        Administra las solicitudes de los distintos módulos de la plataforma.
      </Text>
      
      <SolicitudesTable 
        grupoExtension={grupoExtension}
      />
    </Box>
  );
}