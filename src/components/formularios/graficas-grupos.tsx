"use client";
import React, { useState, useEffect } from 'react';
import { Box, Heading, Flex, Button, Text, Center, Spinner, Badge, useToast } from "@chakra-ui/react";
import { useAuth } from "@/app/context/auth-context";
import { apiRequest } from "@/components/formularios/api";
import { useActividades, ActividadBackend } from "@/components/ui/estadisticas/separar";
import { SimpleBarCharts, SimpleBarCharts1, GraficaAreasPorAnio } from "@/components/ui/estadisticas/graficas";

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
    titulo: "Participantes Reales vs Estimados a Nivel Global", 
    Componente: SimpleBarCharts, 
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
    titulo: "Volumen de Actividades por Estado", 
    Componente: SimpleBarCharts1, 
    dataKey: "porEstado", 
    props: { valorx: "lugar", valory: "CantidadReal", nombreLeyenda: "Cantidad de Actividades" } 
  },
  3: { 
    titulo: "Desempeño Analítico y Rendimiento por Grupos", 
    Componente: SimpleBarCharts, 
    dataKey: "porGrupo", 
    props: { 
      valorx: "lugar", 
      valory: "cantidadEsperada", 
      valory2: "CantidadReal",
      nombreLeyenda: "Meta Estimada",
      nombreLeyenda2: "Resultado Real"
    } 
  },
  4: { 
    titulo: "Cantidad de Actividades por Municipio / Ciudad", 
    Componente: SimpleBarCharts1, 
    dataKey: "porCiudad", 
    props: { valorx: "lugar", valory: "CantidadReal", nombreLeyenda: "Cantidad de Actividades" } 
  },
  5: { 
    titulo: "Histórico de Actividades Ejecutadas por Año", 
    Componente: SimpleBarCharts1, 
    dataKey: "porAnio", 
    props: { valorx: "lugar", valory: "CantidadReal", nombreLeyenda: "Cantidad de Actividades" } 
  },
  6: { 
    titulo: "Evolución de Áreas de Conocimiento por Año", 
    Componente: GraficaAreasPorAnio, 
    dataKey: "porAreaAnio", 
    props: { valorx: "lugar" } 
  }
};

export default function DashboardAdmin() {
  const toast = useToast();
  const { isHydrated } = useAuth();
  
  const [graficaActiva, setGraficaActiva] = useState<number>(1);
  const [loadingBackend, setLoadingBackend] = useState<boolean>(true);
  const [actividadesRaw, setActividadesRaw] = useState<ActividadBackend[]>([]);

  const datosCalculados = useActividades(actividadesRaw);

  useEffect(() => {
    if (!isHydrated) return;

    const cargarMétricasGlobales = async () => {
      try {
        setLoadingBackend(true);
        const token = localStorage.getItem("token") || "";

        const response = await apiRequest("activities?disablePaging=true", {
          method: 'GET',
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response && (response.error || response.status === 500 || response.status === 400)) {
          throw new Error(response.message || "Error al recopilar los registros consolidados del servidor.");
        }

        if (response && response.actividades) {
          setActividadesRaw(response.actividades);
        } else if (Array.isArray(response)) {
          setActividadesRaw(response);
        }
      } catch (error: any) {
        toast({
          title: "Fallo de sincronización general",
          description: error.message || "No se pudieron obtener las métricas globales del sistema.",
          status: "error",
          duration: 6000,
          isClosable: true,
          position: "top"
        });
      } finally {
        setLoadingBackend(false);
      }
    };

    cargarMétricasGlobales();
  }, [isHydrated, toast]);

  if (!isHydrated || loadingBackend) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="red.500" thickness="4px" />
      </Center>
    );
  }

  const renderGraficaActual = () => {
    const config = CONFIG_GRAFICAS[graficaActiva];
    const datosFinales = (datosCalculados as any)[config.dataKey] || [];

    if (datosFinales.length === 0) {
      return (
        <Center h="400px">
          <Text color="gray.500">No hay datos históricos en la base de datos para generar este reporte.</Text>
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
    <Box p={{ base: 4, md: 10 }} maxW="1400px" mx="auto">
      <Box mb={10}>
        <Flex align="center" gap={3}>
          <Heading size="2xl" fontWeight="black" letterSpacing="tight">
            Panel de Control Maestro
          </Heading>
          <Badge colorScheme="red" fontSize="0.8em" borderRadius="full" px={3} py={0.5}>
            ADMIN
          </Badge>
        </Flex>
        <Text fontSize="lg" color="gray.500" mt={1}>
          Visualizando métricas consolidadas de todos los grupos y sedes a nivel nacional.
        </Text>
      </Box>

      <Flex wrap="wrap" gap={3} mb={12}>
        {Object.entries(CONFIG_GRAFICAS).map(([id, config]) => (
          <Button
            key={id}
            onClick={() => setGraficaActiva(Number(id))}
            variant={graficaActiva === Number(id) ? "solid" : "outline"}
            colorScheme="red"
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

      <Box bg="white" p={{ base: 4, md: 8 }} borderRadius="3xl" shadow="2xl" border="2px solid" borderColor="red.50">
        <Heading size="lg" mb={8} color="gray.700">
          {CONFIG_GRAFICAS[graficaActiva]?.titulo}
        </Heading>
        <Box w="100%" h="450px">
          {renderGraficaActual()}
        </Box>
      </Box>
    </Box>
  );
}
