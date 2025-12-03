// /app/admin/usuarios/page.tsx
import { Box, Heading, Text } from '@chakra-ui/react';
import { redirect } from 'next/navigation';
import { UsersTable } from '@/components/ui/users-table';

// Simulación: Obtener lista de usuarios de Educación Continua
async function getEducacionContinuaUsers() {
  const data = [
    { id: 'ec-user-001', nombre: 'Carlos Rodríguez', organismo: 'Facultad de Ingeniería', rol: 'coordinador' },
    { id: 'ec-user-002', nombre: 'Ana Pérez', organismo: 'DEU', rol: 'admin' },
    { id: 'ec-user-003', nombre: 'María García', organismo: 'Facultad de Ciencias Económicas y Sociales', rol: 'proveedor' },
    { id: 'ec-user-004', nombre: 'José López', organismo: 'Facultad de Odontología', rol: 'proveedor' },
    { id: 'ec-user-005', nombre: 'Sofía Martínez', organismo: 'Facultad de Medicina', rol: 'visitante' },
  ];
  return data;
}

// Simulación: Obtener lista de usuarios de Grupos de Extensión
async function getGrupoExtensionUsers() {
  const data = [
    { id: 'ge-user-001', nombre: 'Juan Hernández', organismo: 'Facultad de Arquitectura y Urbanismo', rol: 'coordinador' },
    { id: 'ge-user-002', nombre: 'Luis Vargas', organismo: 'Facultad de Farmacia', rol: 'proveedor' },
    { id: 'ge-user-003', nombre: 'Elena Sosa', organismo: 'Facultad de Veterinaria', rol: 'visitante' },
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

  const educacionContinuaUsers = await getEducacionContinuaUsers();
  const grupoExtensionUsers = await getGrupoExtensionUsers();

  return (
    <Box maxW="container.xl" mx="auto" py={10} px={6}>
      <Heading as="h1" size="xl" mb={4}>Gestión de Usuarios</Heading>
      <Text fontSize="lg" color="gray.500" mb={8}>
        Administra los usuarios registrados y sus permisos en la plataforma.
      </Text>
      
      <UsersTable 
        educacionContinuaUsers={educacionContinuaUsers}
        grupoExtensionUsers={grupoExtensionUsers}
      />
    </Box>
  );
}