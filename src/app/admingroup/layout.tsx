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
  

  const bgColor = useColorModeValue("gray.50", "gray.900");

  useEffect(() => {
    if (isHydrated) {
      
      const roles = (user?.roles || []).map(r => r.toLowerCase().trim());
      
      
      const esAdminDeGrupo = roles.includes('group_admin');
      const esAyudanteDeGrupo = roles.includes('group_helper');

      if (!user || !(esAdminDeGrupo || esAyudanteDeGrupo)) {
        
        router.push("/login?error=unauthorized");
      } else {
        
        setAuthorized(true);
      }
    }
  }, [user, isHydrated, router]);

  
  if (!isHydrated || !authorized) {
    return (
      <Center h="100vh" flexDirection="column" bg="white">
        <Spinner 
          size="xl" 
          color="green.500" 
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