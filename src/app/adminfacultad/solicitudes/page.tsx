import { Box, Heading, Text } from '@chakra-ui/react';
import { Metadata } from "next";
import { SolicitudesTable } from '@/components/ui/solicitudes-table';

export const metadata: Metadata = {
  title: "Solicitudes de Creación de Grupos | GSU",
  description: "Solicitudes de Creación de Grupos de Extensión para esta Facultad.",
};

export default async function SolicitudesFacultyPage() {
  return (
    <Box maxW="container.xl" mx="auto" py={10} px={6}>
      <Heading as="h1" size="xl" mb={4}>Gestión de Solicitudes</Heading>
      <Text fontSize="lg" color="gray.500" mb={8}>
        Administra las solicitudes de creación de grupos de extensión de tu facultad.
      </Text>
      
      {/* Componente cliente en modo Faculty */}
      <SolicitudesTable mode="faculty" />
    </Box>
  );
}