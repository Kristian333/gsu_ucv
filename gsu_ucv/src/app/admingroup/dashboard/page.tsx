"use client";

import React from "react";
import { VStack, Button, Text, Heading } from "@chakra-ui/react";
import NextLink from "next/link";

export default function DashboardPage() {
  return (
    <VStack spacing={12} align="center" justify="center" minH="80vh">
      {/* Botón Crear Grupo */}
      <VStack spacing={4}>
        <Text fontSize="xl" textAlign="center">
          ¡Realiza una solicitud para crear tu Grupo de Extension en el sistema!
        </Text>
        <NextLink href="/admingroup/crear_grupo" passHref>
          <Button background="secondary" color="white" size="lg">
            Crea tu grupo de extensión!
          </Button>
        </NextLink>
      </VStack>

      {/* Sin validar */}
      <Text fontSize="xl" textAlign="center">
        Tu solicitud todavia esta pendiente de revisión.
      </Text>

      {/* Solicitud necesita correción */}
      <VStack spacing={4}>
        <Text fontSize="xl" textAlign="center">
          Tu solicitud ha sido revisada sin enmabro necesita que corrigas ciertos puntos. Lee las observaciones y corrige los puntos mencionados. 
        </Text>
        <NextLink href="/admingroup/corregir_solicitud" passHref>
          <Button background="warning" color="white" size="lg">
            Corregir solicitud
          </Button>
        </NextLink>
      </VStack>

      {/* Mensaje Bienvenida */}
      <Heading size="2xl" textAlign="center">
        ¡Bienvenido a la página de manejo de Grupos de Extensión!
      </Heading>

      {/* Mensaje Validación */}
      <VStack spacing={4}>
        <Text fontSize="xl" textAlign="center">
          ¡Necesitas validar la información de tu Grupo de Extensión!
        </Text>
        <NextLink href="/admingroup/validar" passHref>
          <Button background="secondary" color="white" size="lg">
            Validar información
          </Button>
        </NextLink>
      </VStack>
    </VStack>
  );
}
