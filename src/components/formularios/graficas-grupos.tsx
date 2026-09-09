"use client";
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Heading, Flex, Text, Center, Spinner, useToast, 
  Select, FormControl, FormLabel, HStack 
} from "@chakra-ui/react";
import { useAuth } from "@/app/context/auth-context";
import { apiRequest } from "@/components/formularios/api";
import { TIPOS_ACTIVIDAD } from "@/constants/types";
import { MIN_ANIO_HISTORICO } from "@/constants/general";
import { GroupAnalyticsResponse } from "@/types/analytics";
import {
  SimpleBarCharts1,
  GraficaAreasPorAnio,
  SimpleBarChartsHorizontal
} from "@/components/ui/estadisticas/graficas";

interface ConfigGrafica {
  titulo: string;
  Componente: React.ComponentType<any>;
  dataKey: keyof GroupAnalyticsResponse;
  esRango: boolean;
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
    dataKey: "participantes_por_actividad",
    esRango: false,
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
    dataKey: "actividades_por_estado",
    esRango: false,
    props: { valorx: "lugar", valory: "CantidadReal", nombreLeyenda: "Cantidad de Actividades" } 
  },
  3: { 
    titulo: "Miembros del Grupo que Participaron en las Actividades", 
    Componente: SimpleBarCharts1, 
    dataKey: "participantes_por_actividad",
    esRango: false,
    props: { valorx: "lugar", valory: "integrantes", nombreLeyenda: "Miembros Activos" } 
  },
  4: { 
    titulo: "Cantidad de Actividades por Municipio / Ciudad", 
    Componente: SimpleBarCharts1, 
    dataKey: "actividades_por_ciudad", 
    esRango: false,
    props: { valorx: "lugar", valory: "CantidadReal", nombreLeyenda: "Cantidad de Actividades" } 
  },
  5: { 
    titulo: "Cantidad de Actividades por Año", 
    Componente: SimpleBarCharts1, 
    dataKey: "historico_por_anio", 
    esRango: true,
    props: { valorx: "lugar", valory: "CantidadReal", nombreLeyenda: "Cantidad de Actividades" } 
  },
  6: { 
    titulo: "Distribución de Áreas de Conocimiento por Año", 
    Componente: GraficaAreasPorAnio, 
    dataKey: "areas_conocimiento_por_anio", 
    esRango: true,
    props: { valorx: "lugar" } 
  }
};

interface GraficaGruposProps {
  idGrupo?: string; 
}

export default function GraficaGrupos({ idGrupo }: GraficaGruposProps) {
  const toast = useToast();
  const { isHydrated, user } = useAuth();
  const currentYear = new Date().getFullYear();
  
  const [graficaActiva, setGraficaActiva] = useState<number>(1);
  const [loadingBackend, setLoadingBackend] = useState<boolean>(true);
  const [analyticsData, setAnalyticsData] = useState<GroupAnalyticsResponse | null>(null);
  const [grupoIdDetectado, setGrupoIdDetectado] = useState<string | null>(null);

  // Estados de filtros
  const [anioEspecifico, setAnioEspecifico] = useState<number>(currentYear);
  const [desdeAnio, setDesdeAnio] = useState<number>(currentYear - 3);
  const [hastaAnio, setHastaAnio] = useState<number>(currentYear);

  // Opciones de años para selectores
  const opcionesAnios = Array.from(
    { length: currentYear - MIN_ANIO_HISTORICO + 1 }, 
    (_, i) => currentYear - i
  );

  useEffect(() => {
    if (!isHydrated) return;

    if (idGrupo) {
      setGrupoIdDetectado(idGrupo);
      return;
    }

    if (user?.groupId || user?.group) {
      setGrupoIdDetectado(String(user.groupId || user.group));
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

  const cargarEstadisticasDelGrupo = useCallback(async () => {
    if (!isHydrated || !grupoIdDetectado) return;

    try {
      setLoadingBackend(true);

      const response = await apiRequest("analytics", {
        method: 'POST',
        body: JSON.stringify({
          anio_actual: anioEspecifico,
          desde_anio: desdeAnio,
          hasta_anio: hastaAnio,
          areas_maestras: TIPOS_ACTIVIDAD,
          group_id: grupoIdDetectado
        })
      });

      if (response && (response.error || response.status === 500 || response.status === 400)) {
        throw new Error(response.message || "Error al recopilar las analíticas del servidor.");
      }

      if (response) {
        setAnalyticsData(response);
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
  }, [isHydrated, grupoIdDetectado, anioEspecifico, desdeAnio, hastaAnio, toast]);

  useEffect(() => {
    cargarEstadisticasDelGrupo();
  }, [cargarEstadisticasDelGrupo]);

  // Manejadores de cambios con validación estricta de rangos
  const handleDesdeChange = (nuevoDesde: number) => {
    if (nuevoDesde >= hastaAnio) {
      const ajustado = hastaAnio - 1;
      setDesdeAnio(ajustado);
      toast({
        title: "Rango no permitido",
        description: `El año 'Desde' debe ser menor al año 'Hasta'. Se ajustó automáticamente a ${ajustado}.`,
        status: "warning",
        duration: 4000,
        isClosable: true
      });
    } else {
      setDesdeAnio(nuevoDesde);
    }
  };

  const handleHastaChange = (nuevoHasta: number) => {
    if (nuevoHasta > currentYear) {
      setHastaAnio(currentYear);
      toast({
        title: "Año no permitido",
        description: `El año 'Hasta' no puede ser mayor al año actual (${currentYear}). Se ajustó automáticamente.`,
        status: "warning",
        duration: 4000,
        isClosable: true
      });
    } else if (nuevoHasta <= desdeAnio) {
      const ajustado = hastaAnio;
      toast({
        title: "Rango no permitido",
        description: `El año 'Hasta' debe ser mayor al año 'Desde' (${desdeAnio}).`,
        status: "warning",
        duration: 4000,
        isClosable: true
      });
    } else {
      setHastaAnio(nuevoHasta);
    }
  };

  if (!isHydrated || !grupoIdDetectado) {
    return (
      <Center h="300px">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Center>
    );
  }

  const configActual = CONFIG_GRAFICAS[graficaActiva];

  const renderGraficaActual = () => {
    if (!analyticsData) return null;

    const datosFinales = analyticsData[configActual.dataKey] || [];

    if (datosFinales.length === 0) {
      return (
        <Center h="400px">
          <Text color="gray.500">No se encontraron datos registrados para este grupo.</Text>
        </Center>
      );
    }

    if (graficaActiva === 6) {
      return (
        <configActual.Componente 
          datos={datosFinales} 
          valorx={configActual.props.valorx} 
          areas={TIPOS_ACTIVIDAD}
        />
      );
    }

    return <configActual.Componente datos={datosFinales} {...configActual.props} />;
  };

  return (
    <Box p={0} maxW="1400px" mx="auto">
      <Flex wrap="wrap" gap={4} mb={6} justify="space-between" align="flex-end">
        {/* Selector Dropdown de Tipo de Reporte */}
        <FormControl maxW={{ base: "100%", md: "450px" }}>
          <FormLabel fontWeight="bold" color="gray.700">Seleccionar Gráfica:</FormLabel>
          <Select 
            value={graficaActiva} 
            onChange={(e) => setGraficaActiva(Number(e.target.value))}
            size="md"
            borderRadius="xl"
            borderColor="blue.300"
            focusBorderColor="blue.500"
            fontWeight="medium"
          >
            {Object.entries(CONFIG_GRAFICAS).map(([id, config]) => (
              <option key={id} value={id}>
                {config.titulo}
              </option>
            ))}
          </Select>
        </FormControl>

        {/* Filtros dinámicos de Fechas */}
        {configActual.esRango ? (
          <HStack spacing={3}>
            <FormControl w="140px">
              <FormLabel fontWeight="bold" fontSize="xs" color="gray.600" mb={1}>Desde:</FormLabel>
              <Select 
                value={desdeAnio} 
                onChange={(e) => handleDesdeChange(Number(e.target.value))}
                size="sm"
                borderRadius="lg"
              >
                {opcionesAnios.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </Select>
            </FormControl>
            <FormControl w="140px">
              <FormLabel fontWeight="bold" fontSize="xs" color="gray.600" mb={1}>Hasta:</FormLabel>
              <Select 
                value={hastaAnio} 
                onChange={(e) => handleHastaChange(Number(e.target.value))}
                size="sm"
                borderRadius="lg"
              >
                {opcionesAnios.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </Select>
            </FormControl>
          </HStack>
        ) : (
          <FormControl w={{ base: "100%", sm: "180px" }}>
            <FormLabel fontWeight="bold" fontSize="xs" color="gray.600" mb={1}>Año de Consulta:</FormLabel>
            <Select 
              value={anioEspecifico} 
              onChange={(e) => setAnioEspecifico(Number(e.target.value))}
              size="sm"
              borderRadius="lg"
            >
              {opcionesAnios.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </Select>
          </FormControl>
        )}
      </Flex>

      <Box bg="white" p={{ base: 4, md: 6 }} borderRadius="2xl" border="1px solid" borderColor="gray.100">
        <Heading size="md" mb={6} color="gray.700">
          {configActual?.titulo}
        </Heading>
        <Box w="100%" h="420px">
          {loadingBackend ? (
            <Center h="100%">
              <Spinner size="lg" color="blue.500" />
            </Center>
          ) : (
            renderGraficaActual()
          )}
        </Box>
      </Box>
    </Box>
  );
}
