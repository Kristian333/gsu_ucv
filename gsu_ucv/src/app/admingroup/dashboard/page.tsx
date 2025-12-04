"use client";

import React, { useEffect, useState } from "react";
import { VStack, Button, Text, Heading, Divider, Box } from "@chakra-ui/react";
import NextLink from "next/link";
import { useAuth } from "@/app/context/auth-context";
import { testLog } from "@/data/testLog";


// Función temporal que lee el test.log simulado
function obtenerEstadoDesdeLog(userId, role) {
  // Simulación temporal:
  // En producción esto vendrá de backend.
  const eventos = testLog.filter((l) => l.id === userId);
  if (eventos.length === 0) return null;

  const ultimo = eventos[eventos.length - 1];

  if (role === "Grupo") {
    const info = eventos.filter((e) => e.evento === "GrupoInfoValida").pop();
    return info || null;
  }

  return ultimo;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [estado, setEstado] = useState(null);

  const userRole = user?.role || null;
  const userId = user?.id || null;

  const GroupDash = userRole === "Grupo";
  const InvitadoDash = userRole === "Invitado";

  useEffect(() => {
    if (!userId) return;
    const data = obtenerEstadoDesdeLog(userId, userRole);
    setEstado(data);
  }, [userId, userRole]);

  // Determinar qué sección mostrar
  const mostrar = {
    crearGrupo: false,
    sinValidar: false,
    corregir: false,
    validada: false,
    rechazada: false,
    bienvenidaGrupo: false,
    validarGrupo: false,
  };

  if (InvitadoDash && estado) {
    switch (estado.evento) {
      case "NuevoUsuario":
        mostrar.crearGrupo = true;
        break;
      case "SolicitudNuevoGrupo":
        mostrar.sinValidar = true;
        break;
      case "SolicitudCorregirGrupo":
        mostrar.corregir = true;
        break;
      case "SolicitudGrupoValida":
        mostrar.validada = true;
        break;
      case "SolicitudGrupoRechazada":
        mostrar.rechazada = true;
        break;
    }
  }

  if (GroupDash) {
    const fecha = new Date(estado?.date);
    const limite = new Date(fecha);
    limite.setFullYear(limite.getFullYear() + 1);

    if (new Date() <= limite) {
      mostrar.bienvenidaGrupo = true;
    } else {
      mostrar.validarGrupo = true;
    }
  }

  return (
    <VStack spacing={12} align="center" justify="center" minH="80vh">
      
      {/* Invitado */}
      {InvitadoDash && (
        <>
          {/* Botón Crear Grupo */}
            {mostrar.crearGrupo && (
            <VStack spacing={4}>
              <Text fontSize="xl" textAlign="center">
                ¡Realiza una solicitud para crear tu Grupo de Extensión en el sistema!
              </Text>
              <NextLink href="/admingroup/crear_grupo" passHref>
                <Button background="primary" color="white" size="lg">
                  Crea tu grupo de extensión!
                </Button>
              </NextLink>
            </VStack>
          )}

          {/* Sin validar */}
          {mostrar.sinValidar && (
            <Text fontSize="xl" textAlign="center">
              Tu solicitud todavía está pendiente de revisión.
            </Text>
           )}

          {/* Solicitud necesita correción */}
          {mostrar.corregir && (
            <VStack spacing={4}>
              <Text fontSize="xl" textAlign="center">
                Tu solicitud ha sido revisada, pero necesita correcciones.
              </Text>
              <NextLink href="/admingroup/corregir_solicitud" passHref>
                <Button background="warning" color="white" size="lg">
                  Corregir solicitud
                </Button>
              </NextLink>
            </VStack>
          )}

          {/* Validada */}
          {mostrar.validada && (
            <Text fontSize="xl" textAlign="center">
              Tu solicitud fue aceptada. Por favor inicia sesión como Grupo de Extensión.
            </Text>
          )}

          {/* Rechazada */}
          {mostrar.rechazada && (
            <Text fontSize="xl" textAlign="center">
              Tu solicitud fue rechazada. Por favor preparese para ser exterminado.
            </Text>
          )}
        </>
      )}
      
      {/* Grupos */}
      {GroupDash && (
        <>
          {/* Mensaje Bienvenida al Grupo */}
          {mostrar.bienvenidaGrupo && (
            <>
              <Heading size="2xl" textAlign="center">
                ¡Bienvenido a la página de manejo de Grupos de Extensión!
              </Heading>
            </>
          )}

          {/* Mensaje Validación */}
          {mostrar.validarGrupo && (
            <VStack spacing={4}>
              <Text fontSize="xl" textAlign="center">
                ¡Necesitas validar la información de tu Grupo de Extensión!
              </Text>
              <NextLink href="/admingroup/validar" passHref>
                <Button background="primary" color="white" size="lg">
                  Validar información
                </Button>
              </NextLink>
            </VStack>
          )}
        </>
      )}
      
      {/* Sección Contacto mejorada */}
      <Box
        mt={12}
        w="100%"
        maxW="600px"
        p={8}
        bg="gray.100"
        borderRadius="lg"
        boxShadow="md"
        textAlign="center"
      >
        {/*<Heading size="lg" mb={4} color="primary">
          Información de Contacto
        </Heading>*/}
        <Text fontSize="lg">Para más información:</Text>
        <Text fontSize="md" mt={2}>📧 a@gmail.com</Text>
        <Text fontSize="md">📱 0414-1111111</Text>

        <Divider my={4} />

        <Text fontSize="lg">Dirección de Extensión:</Text>
        <Text fontSize="md" mt={2}>
          Caracas, UCV, Edificio de la Librería, Piso 5
        </Text>
      </Box>
      
    </VStack>
  );
}
