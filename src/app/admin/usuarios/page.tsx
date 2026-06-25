// /app/admin/usuarios/page.tsx
import { Box, Heading, Text } from '@chakra-ui/react';
import { UsersTable } from '@/components/ui/users-table';

export default async function UsuariosPage() {
  return (
    <Box maxW="container.xl" mx="auto" py={10} px={6}>
      <Heading as="h1" size="xl" mb={4}>Gestión de Usuarios</Heading>
      <Text fontSize="lg" color="gray.500" mb={8}>
        Administra los usuarios registrados y sus permisos en la plataforma.
      </Text>
      
      <UsersTable />
    </Box>
  );
}