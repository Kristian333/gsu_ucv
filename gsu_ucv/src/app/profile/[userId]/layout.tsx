// app/profile-hybrid/[userId]/layout.tsx
import React from 'react';
import { Box, Flex, Heading, Container } from '@chakra-ui/react';

// Este componente de layout es estático.
// Se carga instantáneamente para todos los usuarios.
export default function UserProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box bg="gray.100" minH="100vh">
      {/* Header */}
      <Box as="header" bg="blue.600" color="white" p={4} textAlign="center">
        <Heading as="h2" size="xl">Perfil</Heading>
      </Box>

      {/* Main Content */}
      <Flex as="main" justifyContent="center" py={8}>
        <Container maxW="container.lg">
          {children}
        </Container>
      </Flex>
    </Box>
  );
}