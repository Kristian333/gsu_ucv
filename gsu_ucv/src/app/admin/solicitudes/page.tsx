import { Box, Heading, Text } from '@chakra-ui/react';
import { redirect } from 'next/navigation';
import { SolicitudesTable } from '@/components/ui/solicitudes-table';

// Simulación: Obtener solicitudes de Educación Continua
async function getEducacionContinuaSolicitudes() {
  const data = [
    { id: 'sol-001', tipo: 'Código de Proveedor', fecha: '2023-10-26', estado: 'Pendiente', nombre: 'Organización A' },
    { id: 'sol-002', tipo: 'Formulación de Curso - Directa', fecha: '2023-10-25', estado: 'Aprobada', nombre: 'Organización B' },
    { id: 'sol-003', tipo: 'Formulación de Curso - Indirecta', fecha: '2023-10-24', estado: 'Pendiente', nombre: 'Organización C' },
    { id: 'sol-004', tipo: 'Actualización de Curso', fecha: '2023-10-23', estado: 'Pendiente', nombre: 'Organización D' },
  ];
  return data;
}

// Simulación: Obtener solicitudes de Grupo de Extensión
async function getGrupoExtensionSolicitudes() {
  const data = [
    { id: 'sol-101', tipo: 'Solicitud de Evento', fecha: '2023-10-23', estado: 'Pendiente', nombre: 'Grupo de Extensión X' },
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

  const educacionContinua = await getEducacionContinuaSolicitudes();
  const grupoExtension = await getGrupoExtensionSolicitudes();

  return (
    <Box maxW="container.xl" mx="auto" py={10} px={6}>
      <Heading as="h1" size="xl" mb={4}>Gestión de Solicitudes</Heading>
      <Text fontSize="lg" color="gray.500" mb={8}>
        Administra las solicitudes de los distintos módulos de la plataforma.
      </Text>
      
      <SolicitudesTable 
        educacionContinua={educacionContinua}
        grupoExtension={grupoExtension}
      />
    </Box>
  );
}