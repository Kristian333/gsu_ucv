// /app/admin/usuarios/page.tsx
import { Box, Heading, Text } from '@chakra-ui/react';
import { redirect } from 'next/navigation';
import { UsersTable } from '@/components/ui/users-table';

// Simulación: Obtener lista de usuarios de Grupos de Extensión
async function getGrupoExtensionUsers() {
  const data = [
    { id: '1', nombre: 'LAMUN', organismo: '', rol: 'Grupo de Extension' },
    { id: '2', nombre: 'FarmBalia', organismo: 'Facultad de Farmacia', rol: 'Grupo de Extension' },
    { id: '3', nombre: 'Anifriend', organismo: 'Facultad de Veterinaria', rol: 'Grupo de Extension' },
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

export default async function UsuariosPage() {
  await checkAdminRole();

  const grupoExtensionUsers = await getGrupoExtensionUsers();

  return (
    <Box maxW="container.xl" mx="auto" py={10} px={6}>
      <Heading as="h1" size="xl" mb={4}>Gestión de Usuarios</Heading>
      <Text fontSize="lg" color="gray.500" mb={8}>
        Administra los usuarios registrados y sus permisos en la plataforma.
      </Text>
      
      <UsersTable 
        grupoExtensionUsers={grupoExtensionUsers}
      />
    </Box>
  );
}