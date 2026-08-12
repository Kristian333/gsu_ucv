"use client";
import React, { useState, useEffect } from 'react';
import { Box, Heading, Flex, Button, Text, Center, Spinner, useToast } from "@chakra-ui/react";
import { useAuth } from "@/app/context/auth-context";
import { apiRequest } from "@/components/formularios/api";
import { useActividades, ActividadBackend } from "@/components/ui/estadisticas/separar";
import { SimpleBarCharts, SimpleBarCharts1, GraficaAreasPorAnio,SimpleBarChartsHorizontal } from "@/components/ui/estadisticas/graficas";

interface ConfigGrafica {
  titulo: string;
  Componente: React.ComponentType<any>;
  dataKey: string;
  props: {
    valorx: string;
    valory?: string;
    valory2?: string;
    nombreLeyenda?: string;
    nombreLeyenda2?: string;
  };
}

const CONFIG_GRAFICAS: Record<number, ConfigGrafica> = {
  1: { 
    titulo: "Participantes Reales vs Estimados por Actividad", 
    Componente: SimpleBarChartsHorizontal, 
    dataKey: "porActividad", 
    props: { 
      valorx: "lugar", 
      valory: "cantidadEsperada", 
      valory2: "CantidadReal",
      nombreLeyenda: "Participantes Estimados",
      nombreLeyenda2: "Participantes Reales"
    } 
  },
  2: { 
    titulo: "Cantidad de Actividades por Estado", 
    Componente: SimpleBarCharts1, 
    dataKey: "porEstado", 
    props: { valorx: "lugar", valory: "CantidadReal", nombreLeyenda: "Cantidad de Actividades" } 
  },
  3: { 
    titulo: "Miembros del Grupo que Participaron en las Actividades", 
    Componente: SimpleBarCharts1, 
    dataKey: "porActividad", 
    props: { valorx: "lugar", valory: "integrantes", nombreLeyenda: "Miembros Activos" } 
  },
  4: { 
    titulo: "Cantidad de Actividades por Municipio / Ciudad", 
    Componente: SimpleBarCharts1, 
    dataKey: "porCiudad", 
    props: { valorx: "lugar", valory: "CantidadReal", nombreLeyenda: "Cantidad de Actividades" } 
  },
  5: { 
    titulo: "Cantidad de Actividades por Año", 
    Componente: SimpleBarCharts1, 
    dataKey: "porAnio", 
    props: { valorx: "lugar", valory: "CantidadReal", nombreLeyenda: "Cantidad de Actividades" } 
  },
  6: { 
    titulo: "Distribución de Áreas de Conocimiento por Año", 
    Componente: GraficaAreasPorAnio, 
    dataKey: "porAreaAnio", 
    props: { valorx: "lugar" } 
  }
};

interface GraficaGruposProps {
  idGrupo?: string; 
}

export default function GraficaGrupos({ idGrupo }: GraficaGruposProps) {
  const toast = useToast();
  const { isHydrated, user } = useAuth();
  
  const [graficaActiva, setGraficaActiva] = useState<number>(1);
  const [loadingBackend, setLoadingBackend] = useState<boolean>(true);
  const [actividadesRaw, setActividadesRaw] = useState<ActividadBackend[]>([]);
  const [grupoIdDetectado, setGrupoIdDetectado] = useState<string | null>(null);

  useEffect(() => {
    if (!isHydrated) return;

    if (idGrupo) {
      setGrupoIdDetectado(idGrupo);
      return;
    }

    if (user?.groupId || user?.group_id || user?.group || user?.nombre_grupo) {
      setGrupoIdDetectado(String(user.groupId || user.group_id || user.group || user.nombre_grupo));
    } else {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const payloadBase64 = token.split('.');
          if (payloadBase64 && payloadBase64[1]) {
            const payloadDecodificado = JSON.parse(atob(payloadBase64[1]));
            const idDesdeToken = payloadDecodificado.groupId || payloadDecodificado.group_id || payloadDecodificado.group || payloadDecodificado.nombre_grupo;
            if (idDesdeToken) {
              setGrupoIdDetectado(String(idDesdeToken));
            }
          }
        } catch (e) {
          console.error("Error al decodificar token", e);
        }
      }
    }
  }, [isHydrated, user, idGrupo]); 

  const datosCalculados = useActividades(actividadesRaw);

  useEffect(() => {
    if (!isHydrated || !grupoIdDetectado) return;

    const cargarEstadisticasDelGrupo = async () => {
      try {
        setLoadingBackend(true);
        const token = localStorage.getItem("token") || "";

        const response = await apiRequest(`activities?group_id=${grupoIdDetectado}&disablePaging=true`, {
          method: 'GET',
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response && (response.error || response.status === 500 || response.status === 400)) {
          throw new Error(response.message || "Error al recopilar los registros del servidor.");
        }

        if (response && response.actividades) {
          setActividadesRaw(response.actividades);
        } else if (Array.isArray(response)) {
          setActividadesRaw(response);
        }
      } catch (error: any) {
        toast({
          title: "Error de sincronización",
          description: error.message || "Fallo al conectar con las métricas del servidor.",
          status: "error",
          duration: 5000,
          isClosable: true
        });
      } finally {
        setLoadingBackend(false);
      }
    };

    cargarEstadisticasDelGrupo();
  }, [isHydrated, grupoIdDetectado, toast]);

  if (!isHydrated || !grupoIdDetectado || loadingBackend) {
    return (
      <Center h="300px">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Center>
    );
  }

  const renderGraficaActual = () => {
    const config = CONFIG_GRAFICAS[graficaActiva];
    const datosFinales = (datosCalculados as any)[config.dataKey] || [];

    if (datosFinales.length === 0) {
      return (
        <Center h="400px">
          <Text color="gray.500">No se encontraron actividades registradas para este grupo.</Text>
        </Center>
      );
    }

    if (graficaActiva === 6) {
      return (
        <config.Componente 
          datos={datosFinales} 
          valorx={config.props.valorx} 
          areas={datosCalculados.todasLasAreas} 
        />
      );
    }

    return <config.Componente datos={datosFinales} {...config.props} />;
  };

  return (
    <Box p={0} maxW="1400px" mx="auto">
      <Flex wrap="wrap" gap={3} mb={8}>
        {Object.entries(CONFIG_GRAFICAS).map(([id, config]) => (
          <Button
            key={id}
            onClick={() => setGraficaActiva(Number(id))}
            variant={graficaActiva === Number(id) ? "solid" : "outline"}
            colorScheme="blue"
            borderRadius="full"
            px={6}
            size="sm"
            _hover={{ transform: "translateY(-2px)", shadow: "md" }}
            transition="all 0.2s"
          >
            {config.titulo}
          </Button>
        ))}
      </Flex>

      <Box bg="white" p={{ base: 4, md: 6 }} borderRadius="2xl" border="1px solid" borderColor="gray.100">
        <Heading size="md" mb={6} color="gray.700">
          {CONFIG_GRAFICAS[graficaActiva]?.titulo}
        </Heading>
        <Box w="100%" h="420px">
          {renderGraficaActual()}
        </Box>
      </Box>
    </Box>
  );
}
