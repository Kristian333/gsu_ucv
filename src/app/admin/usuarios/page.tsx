// /app/admin/usuarios/page.tsx
import { Box, Heading, Text } from '@chakra-ui/react';
import { Metadata } from "next";
import { UsersTable } from '@/components/ui/users-table';
import { apiServerRequest } from "@/utils/apiServer";

async function getInitialUsers() {
  try {
    // Usamos el script de servidor optimizado sin vulnerar el localStorage
    const data = await apiServerRequest("users?per_page=100", {
      cache: "no-store" // Datos siempre frescos para paneles administrativos
    });
    return data?.usuarios || [];
  } catch (error) {
    console.error("ADMIN USERS SERVER - Error precargando usuarios:", error);
    return []; // Fallback seguro
  }
}

export const metadata: Metadata = {
  title: "Usuarios del sistema | GSU",
  description: "Usuarios registraods en el sistema.",
};

export default async function UsuariosPage() {
  const initialUsers = await getInitialUsers();

  return (
    <Box maxW="container.xl" mx="auto" py={10} px={6}>
      <Heading as="h1" size="xl" mb={4}>Gestión de Usuarios</Heading>
      <Text fontSize="lg" color="gray.500" mb={8}>
        Administra los usuarios registrados y sus permisos en la plataforma.
      </Text>
      
      <UsersTable initialUsers={initialUsers} />
    </Box>
  );
}