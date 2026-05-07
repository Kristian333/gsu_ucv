"use client";

import { Box, Flex, Center, Spinner, Text, useColorModeValue } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { AdminGroupNavbar } from '@/components/layout/admingroup-navbar';
import { useAuth } from "@/app/context/auth-context";
import { useRouter } from "next/navigation";

export default function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  const { user, isHydrated } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  
  // Color de fondo para el área de trabajo de grupos
  const bgColor = useColorModeValue("gray.50", "gray.900");

  useEffect(() => {
    if (isHydrated) {
      // 1. Obtenemos y limpiamos los roles del usuario
      const roles = (user?.roles || []).map(r => r.toLowerCase().trim());
      
      // 2. Definimos quiénes pueden entrar a este layout de Grupos
      const esAdminDeGrupo = roles.includes('group_admin');
      const esAyudanteDeGrupo = roles.includes('group_helper');

      if (!user || !(esAdminDeGrupo || esAyudanteDeGrupo)) {
        // Si no tiene el rol, mandamos a login con error
        router.push("/login?error=unauthorized");
      } else {
        // Si todo está ok, autorizamos la vista
        setAuthorized(true);
      }
    }
  }, [user, isHydrated, router]);

  // Pantalla de carga (Igual que en Facultad para consistencia)
  if (!isHydrated || !authorized) {
    return (
      <Center h="100vh" flexDirection="column" bg="white">
        <Spinner 
          size="xl" 
          color="green.500" // Verde para diferenciar visualmente que es Grupo
          thickness="4px" 
          speed="0.65s" 
          emptyColor="gray.100"
        />
        <Text mt={4} fontWeight="medium" color="gray.600">
          Cargando Panel de Grupo...
        </Text>
      </Center>
    );
  }

  return (
    <Flex minH="100vh" direction="row">
      {/* Sidebar específica para Grupos */}
      <AdminGroupNavbar />
      
      {/* Área de contenido principal */}
      <Box 
        as="main" 
        flex="1" 
        p={{ base: 4, md: 8, lg: 10 }} 
        bg={bgColor}
        overflowY="auto"
      >
        <Box 
          maxW="1400px" 
          mx="auto" 
          bg="white" 
          boxShadow="sm" 
          borderRadius="xl" 
          p={6}
          minH="85vh"
        >
          {children}
        </Box>
      </Box>
    </Flex>
  );
}