"use client";

import React, { useEffect, useState } from "react";
import { VStack, Button, Text, Heading, Divider, Box, Spinner } from "@chakra-ui/react";
import NextLink from "next/link";
import { useAuth } from "@/app/context/auth-context";
import { apiRequest } from "@/components/formularios/api";

interface GroupData {
  id: any;
  nombre: string;
  descripcion: string;
  propietario: {
    id: any;
  };
  ubicacion: string;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
  // Añade aquí campos adicionales si tu backend maneja estados de solicitud (ej: status_solicitud: string)
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);

  const [miGrupo, setMiGrupo] = useState<GroupData | null>(null);
  const [infoAlDia, setInfoAlDia] = useState<boolean>(false);

  const rolesArray = (user?.roles || []).map(r => r.toLowerCase().trim());
  const userIdStr = user?.id || null;

  const GroupDash = rolesArray.includes("group_admin") || rolesArray.includes("group_helper");
  const VisitanteDash = rolesArray.includes("visitante");

  useEffect(() => {
    if (!userIdStr || (!GroupDash && !VisitanteDash)) {
      setLoading(false);
      return;
    }

    async function cargarEstadoDashboard() {
      try {
        // Consultamos el listado de grupos usando el apiRequest de tu compañero
        const data = await apiRequest("groups?per_page=50", { method: "GET" });
        const listaGrupos: GroupData[] = data.grupos || [];

        // Buscamos si este usuario es dueño de algún grupo
        const grupoEncontrado = listaGrupos.find(
          g => g.propietario && String(g.propietario.id).trim() === String(userIdStr).trim()
        );

        if (grupoEncontrado) {
          setMiGrupo(grupoEncontrado);

          // Verificación de vigencia de 1 año (Misma lógica del Navbar)
          if (grupoEncontrado.actualizado_en) {
            const fechaActualizacion = new Date(grupoEncontrado.actualizado_en);
            const fechaLimite = new Date(fechaActualizacion);
            fechaLimite.setFullYear(fechaLimite.getFullYear() + 1);

            const hoy = new Date();
            setInfoAlDia(hoy < fechaLimite);
          }
        }
      } catch (error) {
        console.error("Error al cargar la información del dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    cargarEstadoDashboard();
  }, [userIdStr, GroupDash, VisitanteDash]);

  // Pantalla de carga limpia mientras consulta la API de Go
  if (loading) {
    return (
      <VStack spacing={4} align="center" justify="center" minH="80vh">
        <Spinner size="xl" color="green.500" thickness="4px" />
        <Text fontSize="lg" color="gray.500">Cargando tu panel de control...</Text>
      </VStack>
    );
  }

  // Lógica de banderas visuales en base a la data real del backend
  const mostrar = {
    crearGrupo: VisitanteDash && !miGrupo, // No tiene grupo creado aún
    sinValidar: VisitanteDash && miGrupo && !miGrupo.activo, // Tiene grupo pero el admin general no lo ha activado
    corregir: false, // Puedes activar esta bandera si añades un campo de observaciones en tu BD
    validada: VisitanteDash && miGrupo && miGrupo.activo, // Es visitante pero su grupo ya fue aprobado
    bienvenidaGrupo: GroupDash && infoAlDia, // Es admin/helper y su info anual está vigente
    validarGrupo: GroupDash && !infoAlDia, // Es admin/helper pero requiere actualización anual
  };

  return (
    <VStack spacing={12} align="center" justify="center" minH="80vh" w="full" px={4}>
      
      {/* Visitante */}
      {VisitanteDash && (
        <>
          {/* Botón Crear Grupo */}
            {mostrar.crearGrupo && (
            <VStack spacing={4}>
              <Text fontSize="xl" textAlign="center">
                ¡Realiza una solicitud para crear tu Grupo de Extensión en el sistema!
              </Text>
              <NextLink href="/admingroup/crear_grupo" passHref>
                <Button background="primary" color="white" size="lg">
                  ¡Crea tu grupo de extensión!
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
          
          {mostrar.bienvenidaGrupo && (
            <>
              <Heading size="2xl" textAlign="center">
                ¡Bienvenido a la página de manejo de Grupos de Extensión!
              </Heading>
            </>
          )}

          {mostrar.validarGrupo && (
            <VStack spacing={4}>
              <Text fontSize="xl" textAlign="center">
                ¡Necesitas validar la información de tu Grupo de Extensión!
              </Text>
              <NextLink href="/admingroup/validar_grupo" passHref>
                <Button background="primary" color="white" size="lg">
                  Validar información
                </Button>
              </NextLink>
            </VStack>
          )}
        </>
      )}
      
 
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
        
        <Text fontSize="lg">Para más información:</Text>
        <Text fontSize="md" mt={2}>📧 deu.depgsu@gmail.com</Text>
        <Text fontSize="md">📱 412-5502096</Text>

        <Divider my={4} />

        <Text fontSize="lg">Dirección de Extensión:</Text>
        <Text fontSize="md" mt={2}>
          Caracas, UCV, Edif. Biblioteca Central, Piso 5
        </Text>
      </Box>
      
    </VStack>
  );
}
