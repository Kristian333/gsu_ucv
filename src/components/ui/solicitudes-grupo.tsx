"use client";

import { Box, Heading, Container, Button, Flex } from "@chakra-ui/react";
import { SolicitudesTable } from "@/components/ui/solicitudes-table";
import { useAuth } from "@/app/context/auth-context";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function SolicitudesList() {
  const { user } = useAuth();
  const groupId = user?.groupId; 

  return (
    <Container maxW="container.xl" py={8}>
      {/* Header con Título y Botón Principal */}
      <Flex 
        justify="space-between" 
        align="center" 
        mb={6} 
        wrap="wrap" 
        gap={4}
      >
        <Box>
          <Heading size="lg" mb={1}>
            Solicitudes de Recursos del Grupo
          </Heading>
        </Box>

        <Button
          as={Link}
          href="/admingroup/solicitud/nueva"
          bg="primary.600"
          color="white"
          leftIcon={<Plus size={18} />}
          _hover={{ bg: "primary.700" }}
        >
          Realizar nueva solicitud
        </Button>
      </Flex>

      {groupId ? (
        <SolicitudesTable mode="group" groupId={groupId} />
      ) : (
        <Box color="gray.500">Cargando información del grupo...</Box>
      )}
    </Container>
  );
}