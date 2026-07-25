"use client";

import React, { useEffect, useState } from "react";
import { 
  Box, 
  Heading, 
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel, 
  Center, 
  Spinner, 
  Text,
  Badge
} from "@chakra-ui/react";
import { apiRequest } from "@/components/formularios/api";
import TablaNuestrasActividades from "@/components/ui/tabla-nuestras-actividades";

interface Actividad {
  id: number | string;
  nombre?: string;
  location?: string;
  fecha: string; 
  descripcion?: string;
  financiamiento?: string;
  financing_org?: string;
  image?: string;
  reporte_completado?: boolean; 
}

export default function VistaNuestrasActividadesForm() {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarActividades = async () => {
      try {
        // 1. CAPTURA DINÁMICA: Obtenemos el ID del grupo que inició sesión
        const storedGroupId = localStorage.getItem("group_id");
        if (!storedGroupId) {
          throw new Error("No se detectó una sesión activa para el grupo.");
        }

        // 2. RUTA EXACTA DE POSTMAN: Usamos la ruta limpia pasando el ID dinámico
        const response = await apiRequest(`activities?group_id=${storedGroupId}`, { method: "GET" });

        if (response && !response.error) {
          // 3. EXTRACCIÓN SEGÚN TU JSON: El Postman muestra que viene dentro de response.actividades
          if (response.actividades && Array.isArray(response.actividades)) {
            setActividades(response.actividades);
          } else if (Array.isArray(response)) {
            setActividades(response);
          } else {
            setActividades([]);
          }
        } else {
          throw new Error("No se pudo sincronizar la información con el servidor.");
        }
      } catch (err: any) {
        setError(err.message || "Error al conectar con la base de datos.");
      } finally {
        setLoading(false);
      }
    };

    cargarActividades();
  }, []);

  // --- LÓGICA DE CLASIFICACIÓN DE INFORMACIÓN ---
  const hoyStr = new Date().toISOString().substring(0, 10); 
  const anioActual = new Date().getFullYear(); 

  const actividadesPendientes = actividades.filter(act => {
    if (!act.fecha) return false;
    const fechaAct = act.fecha.substring(0, 10);
    const anioAct = new Date(act.fecha).getFullYear();
    return anioAct === anioActual && fechaAct > hoyStr;
  });

  const actividadesEsperaReporte = actividades.filter(act => {
    if (!act.fecha) return false;
    const fechaAct = act.fecha.substring(0, 10);
    const anioAct = new Date(act.fecha).getFullYear();
    return anioAct === anioActual && fechaAct <= hoyStr && !act.reporte_completado;
  });

  const actividadesViejasAnio = actividades.filter(act => {
    if (!act.fecha) return false;
    const fechaAct = act.fecha.substring(0, 10);
    const anioAct = new Date(act.fecha).getFullYear();
    return anioAct === anioActual && fechaAct <= hoyStr && act.reporte_completado;
  });

  const historialCompleto = actividades;

  if (loading) {
    return (
      <Center h="60vh" flexDirection="column" gap={4}>
        <Spinner size="xl" color="teal.500" thickness="4px" />
        <Text fontSize="lg" color="gray.600">Obteniendo el registro de actividades...</Text>
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="60vh">
        <Box p={6} textAlign="center" borderRadius="lg" bg="red.50" color="red.600" shadow="sm" maxW="450px">
          <Heading size="md" mb={2}>Error de Comunicación</Heading>
          <Text>{error}</Text>
        </Box>
      </Center>
    );
  }

  return (
    <Box maxW="container.xl" mx="auto" py={10} px={6}>
      <Heading mb={6}>Nuestras Actividades — LAMUN</Heading>

      <Tabs variant="enclosed" colorScheme="teal">
        <TabList mb={4} overflowX="auto" overflowY="hidden" whiteSpace="nowrap">
          <Tab fontWeight="semibold">
            Pendientes
            <Badge ml={2} colorScheme="teal" borderRadius="full">{actividadesPendientes.length}</Badge>
          </Tab>
          <Tab fontWeight="semibold">
            Esperan Reporte
            <Badge ml={2} colorScheme="orange" borderRadius="full">{actividadesEsperaReporte.length}</Badge>
          </Tab>
          <Tab fontWeight="semibold">
            Pasadas ({anioActual})
            <Badge ml={2} colorScheme="blue" borderRadius="full">{actividadesViejasAnio.length}</Badge>
          </Tab>
          <Tab fontWeight="semibold">Historial Total</Tab>
        </TabList>

        <TabPanels bg="white" borderRadius="lg" shadow="sm" border="1px" borderColor="gray.200" p={4}>
          <TabPanel>
            {actividadesPendientes.length === 0 ? (
              <Text color="gray.500" py={4} textAlign="center">No hay actividades planificadas próximas.</Text>
            ) : (
              <TablaNuestrasActividades actividades={actividadesPendientes} permitirEditar={true} />
            )}
          </TabPanel>

          <TabPanel>
            {actividadesEsperaReporte.length === 0 ? (
              <Text color="gray.500" py={4} textAlign="center">No hay actividades pendientes por reportar.</Text>
            ) : (
              <TablaNuestrasActividades actividades={actividadesEsperaReporte} permitirEditar={false} />
            )}
          </TabPanel>

          <TabPanel>
            {actividadesViejasAnio.length === 0 ? (
              <Text color="gray.500" py={4} textAlign="center">No se registran actividades finalizadas este año.</Text>
            ) : (
              <TablaNuestrasActividades actividades={actividadesViejasAnio} permitirEditar={false} />
            )}
          </TabPanel>

          <TabPanel>
            {historialCompleto.length === 0 ? (
              <Text color="gray.500" py={4} textAlign="center">El historial se encuentra vacío.</Text>
            ) : (
              <TablaNuestrasActividades actividades={historialCompleto} permitirEditar={false} />
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}