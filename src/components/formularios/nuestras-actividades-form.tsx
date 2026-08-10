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
  Badge,
  useToast
} from "@chakra-ui/react";
import { apiRequest } from "@/components/formularios/api";
import { useAuth } from "@/app/context/auth-context";
import TablaNuestrasActividades from "@/components/ui/tabla-nuestras-actividades";

interface Actividad {
  id: number | string;
  nombre?: string;
  ubicacion?: string; 
  location?: string;
  fecha_inicio: string; 
  fecha_fin: string;    
  descripcion?: string;
  financiamiento?: string;
  financing_org?: string;
  image?: string;
  reporte_completado?: boolean;
  beneficiados_reales?: number | string | null;
  destacada?: boolean;
  is_featured?: boolean;
}

export default function VistaNuestrasActividadesForm() {
  const toast = useToast();
  const { user, isHydrated } = useAuth();
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarActividades = async () => {
    try {
      const storedGroupId = user?.groupId;
      const token = localStorage.getItem("token") || "";

      if (!storedGroupId) {
        throw new Error("No se detectó una sesión activa para el grupo.");
      }

      const response = await apiRequest(`activities?group_id=${storedGroupId}&disablePaging=true`, { 
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response && !response.error) {
        let listaActividades: Actividad[] = [];

        if (response.actividades && Array.isArray(response.actividades)) {
          listaActividades = response.actividades;
        } else if (Array.isArray(response)) {
          listaActividades = response;
        }

        const actividadesProcesadas = listaActividades.map((act) => {
          return {
            ...act,
            location: act.ubicacion || "Sin ubicación registrada",
            destacada: !!act.is_featured || !!act.destacada
          };
        });

        setActividades(actividadesProcesadas);
      } else {
        throw new Error(response?.message || "No se pudo sincronizar la información con el servidor.");
      }
    } catch (err: any) {
      setError(err.message || "Error al conectar con la base de datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isHydrated) return;
    cargarActividades();
  }, [isHydrated, user?.groupId]);

  const hoyStr = new Date().toISOString().substring(0, 10); 
  const anioActual = new Date().getFullYear(); 

  const actividadesPendientes = actividades.filter(act => {
    if (!act.fecha_inicio) return false;
    const inicioAct = act.fecha_inicio.substring(0, 10);
    return hoyStr < inicioAct;
  });

  const actividadesEnCurso = actividades.filter(act => {
    if (!act.fecha_inicio || !act.fecha_fin) return false;
    const inicioAct = act.fecha_inicio.substring(0, 10);
    const finAct = act.fecha_fin.substring(0, 10);
    return hoyStr >= inicioAct && hoyStr <= finAct;
  });

  const actividadesEsperaReporte = actividades.filter(act => {
    if (!act.fecha_fin) return false;
    const finAct = act.fecha_fin.substring(0, 10);
    const reporteVacio = !act.reporte_completado || !act.beneficiados_reales;
    return hoyStr > finAct && reporteVacio;
  });

  const actividadesViejasAnio = actividades.filter(act => {
    if (!act.fecha_fin) return false;
    const finAct = act.fecha_fin.substring(0, 10);
    const anioAct = new Date(act.fecha_fin).getFullYear();
    const reporteCompletado = act.reporte_completado || !!act.beneficiados_reales;
    return anioAct === anioActual && hoyStr > finAct && reporteCompletado;
  });

  const historialCompleto = actividades;

  if (!isHydrated || loading) {
    return (
      <Center h="60vh" flexDirection="column" gap={4}>
        <Spinner size="xl" color="teal.500" thickness="4px" />
        <Text fontSize="lg" color="gray.600">Obteniendo el registro completo de actividades...</Text>
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
            En Curso 🔥
            <Badge ml={2} colorScheme="green" borderRadius="full">{actividadesEnCurso.length}</Badge>
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
              <TablaNuestrasActividades actividades={actividadesPendientes} permitirEditar={true} onRefresh={cargarActividades} />
            )}
          </TabPanel>

          <TabPanel>
            {actividadesEnCurso.length === 0 ? (
              <Text color="gray.500" py={4} textAlign="center">No hay actividades ejecutándose el día de hoy.</Text>
            ) : (
              <TablaNuestrasActividades actividades={actividadesEnCurso} permitirEditar={true} onRefresh={cargarActividades} />
            )}
          </TabPanel>

          <TabPanel>
            {actividadesEsperaReporte.length === 0 ? (
              <Text color="gray.500" py={4} textAlign="center">No hay actividades pendientes por reportar.</Text>
            ) : (
              <TablaNuestrasActividades 
                actividades={actividadesEsperaReporte} 
                permitirEditar={false} 
                mostrarDestacados={true} 
                onRefresh={cargarActividades} 
              />
            )}
          </TabPanel>

          <TabPanel>
            {actividadesViejasAnio.length === 0 ? (
              <Text color="gray.500" py={4} textAlign="center">No se registran actividades finalizadas este año.</Text>
            ) : (
              <TablaNuestrasActividades 
                actividades={actividadesViejasAnio} 
                permitirEditar={false} 
                mostrarDestacados={true} 
                onRefresh={cargarActividades} 
              />
            )}
          </TabPanel>

          <TabPanel>
            {historialCompleto.length === 0 ? (
              <Text color="gray.500" py={4} textAlign="center">El historial se encuentra vacío.</Text>
            ) : (
              <TablaNuestrasActividades 
                actividades={historialCompleto} 
                permitirEditar={false} 
                mostrarDestacados={true} 
                onRefresh={cargarActividades} 
              />
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
