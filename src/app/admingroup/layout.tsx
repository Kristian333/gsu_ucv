// /app/admingroup/layout.tsx
import React from 'react';
import { Flex, Box } from '@chakra-ui/react';
import { AdminGroupNavbar } from '@/components/layout/admingroup-navbar';
import { AdminGroupGuard } from '@/components/layout/admingroup-guard';

interface LayoutProps {
  children: React.ReactNode;
}

export default function AdminGroupLayout({ children }: LayoutProps) {
  return (
    <AdminGroupGuard>
      <Flex minH="100vh" direction="row">
        {/* El Navbar ahora es un componente cliente inteligente y autónomo */}
        <AdminGroupNavbar />
        
        <Box 
          as="main" 
          flex="1" 
          p={{ base: 4, md: 8, lg: 10 }} 
          bg="gray.50"
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
    </AdminGroupGuard>
  );
}