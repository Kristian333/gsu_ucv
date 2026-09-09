"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Heading, Flex, Text, Center, Spinner, Badge, useToast,
  Tabs, TabList, TabPanels, Tab, TabPanel, Select, FormControl, FormLabel, HStack 
} from "@chakra-ui/react";
import { useAuth } from "@/app/context/auth-context";
import { apiRequest } from "@/components/formularios/api";
import { TIPOS_ACTIVIDAD } from "@/constants/types";
import { MIN_ANIO_HISTORICO } from "@/constants/general";
import { GroupAnalyticsResponse } from "@/types/analytics";
import {
  SimpleBarCharts,
  SimpleBarCharts1,
  GraficaAreasPorAnio,
  SimpleBarChartsHorizontal
} from "@/components/ui/estadisticas/graficas";

import GraficaGrupos from "./graficas-grupos"; 

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

interface GrupoBackend {
  id: string;
  nombre: string;
}

const CONFIG_GRAFICAS: Record<number, ConfigGrafica> = {
  1: {
    titulo: "Participantes Reales vs Estimados",
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
    titulo: "Volumen de Actividades por Estado",
    Componente: SimpleBarCharts1,
    dataKey: "actividades_por_estado",
    esRango: false,
    props: { valorx: "lugar", valory: "CantidadReal", nombreLeyenda: "Cantidad de Actividades" }
  },
  3: {
    titulo: "Total de Participantes Reales vs Estimados por Grupos",
    Componente: SimpleBarCharts,
    dataKey: "participantes_por_grupo",
    esRango: false,
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
    dataKey: "actividades_por_ciudad",
    esRango: false,
    props: { valorx: "lugar", valory: "CantidadReal", nombreLeyenda: "Cantidad de Actividades" }
  },
  5: {
    titulo: "Histórico de Actividades Ejecutadas por Año",
    Componente: SimpleBarCharts1,
    dataKey: "historico_por_anio", 
    esRango: true,
    props: { valorx: "lugar", valory: "CantidadReal", nombreLeyenda: "Cantidad de Actividades" }
  },
  6: {
    titulo: "Distribución Global de Áreas de Conocimiento por Año",
    Componente: GraficaAreasPorAnio,
    dataKey: "areas_conocimiento_por_anio",
    esRango: true,
    props: { valorx: "lugar" }
  }
};

export default function DashboardAdmin() {
  const toast = useToast();
  const { isHydrated } = useAuth();
  const currentYear = new Date().getFullYear();
  
  const [graficaActiva, setGraficaActiva] = useState<number>(1);
  const [loadingBackend, setLoadingBackend] = useState<boolean>(true);
  const [analyticsData, setAnalyticsData] = useState<GroupAnalyticsResponse | null>(null);

  const [listaGrupos, setListaGrupos] = useState<GrupoBackend[]>([]);
  const [grupoIdSeleccionado, setGrupoIdSeleccionado] = useState<string>("");

  // Estados para filtros de tiempo globales
  const [anioEspecifico, setAnioEspecifico] = useState<number>(currentYear);
  const [desdeAnio, setDesdeAnio] = useState<number>(currentYear - 3);
  const [hastaAnio, setHastaAnio] = useState<number>(currentYear);

  const opcionesAnios = Array.from(
    { length: currentYear - MIN_ANIO_HISTORICO + 1 }, 
    (_, i) => currentYear - i
  );

  const cargarDatosDashboard = useCallback(async () => {
    if (!isHydrated) return;
    try {
      setLoadingBackend(true);
      
      const [resAnalytics, resGrupos] = await Promise.all([
        apiRequest("analytics", {
          method: 'POST',
          body: JSON.stringify({
            anio_actual: anioEspecifico,
            desde_anio: desdeAnio,
            hasta_anio: hastaAnio,
            areas_maestras: TIPOS_ACTIVIDAD
          })
        }),
        apiRequest("groups?simplelist=true", {
          method: 'GET'
        })
      ]);

      if (resAnalytics) {
        setAnalyticsData(resAnalytics);
      }

      if (resGrupos) {
        const gruposArray = resGrupos.grupos || (Array.isArray(resGrupos) ? resGrupos : []);
        setListaGrupos(gruposArray);
      }

    } catch (error: any) {
      toast({
        title: "Error de carga",
        description: error.message || "No se pudieron obtener las analíticas del sistema.",
        status: "error",
        duration: 6000,
        isClosable: true,
        position: "top"
      });
    } finally {
      setLoadingBackend(false);
    }
  }, [isHydrated, anioEspecifico, desdeAnio, hastaAnio, toast]);

  useEffect(() => {
    cargarDatosDashboard();
  }, [cargarDatosDashboard]);

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
  
  if (!isHydrated) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="red.500" thickness="4px" />
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
          <Text color="gray.500">No hay datos históricos suficientes en el sistema para generar este reporte.</Text>
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
    <Box p={{ base: 4, md: 10 }} maxW="1400px" mx="auto">
      <Box mb={8}>
        <Flex align="center" gap={3}>
          <Heading as="h1" size="xl" mb={2}>
            Estadísticas Generales de los Grupos
          </Heading>
          <Badge colorScheme="primary" fontSize="0.8em" borderRadius="full" px={3} py={0.5}>
            ADMIN
          </Badge>
        </Flex>
        <Text fontSize="lg" color="gray.500" mb={8}>
          Visualizando métricas consolidadas de todos los grupos, áreas y sedes universitarias a nivel nacional.
        </Text>
      </Box>

      <Tabs variant="enclosed" colorScheme="secondary">
        <TabList mb={6}>
          <Tab fontWeight="bold">Métricas Globales</Tab>
          <Tab fontWeight="bold">Análisis por Grupo Específico</Tab>
        </TabList>

        <TabPanels>
          <TabPanel p={0}>
            {/* Controles superiores: Selector de Reporte + Filtro Anual */}
            <Flex wrap="wrap" gap={4} mb={6} justify="space-between" align="flex-end">
              <FormControl maxW={{ base: "100%", md: "450px" }}>
                <FormLabel fontWeight="bold" color="gray.700">Seleccionar Reporte Global:</FormLabel>
                <Select 
                  value={graficaActiva} 
                  onChange={(e) => setGraficaActiva(Number(e.target.value))}
                  size="md"
                  borderRadius="xl"
                  borderColor="red.300"
                  focusBorderColor="red.500"
                  fontWeight="medium"
                >
                  {Object.entries(CONFIG_GRAFICAS).map(([id, config]) => (
                    <option key={id} value={id}>
                      {config.titulo}
                    </option>
                  ))}
                </Select>
              </FormControl>

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

            <Box bg="white" p={{ base: 4, md: 8 }} borderRadius="3xl" shadow="2xl" border="2px solid" borderColor="red.50">
              <Heading size="lg" mb={8} color="gray.700">
                {configActual?.titulo}
              </Heading>
              <Box w="100%" h="450px">
                {loadingBackend ? (
                  <Center h="100%">
                    <Spinner size="xl" color="red.500" />
                  </Center>
                ) : (
                  renderGraficaActual()
                )}
              </Box>
            </Box>
          </TabPanel>

          <TabPanel p={0}>
            <Box bg="white" p={{ base: 6, md: 8 }} borderRadius="3xl" shadow="xl" border="1px solid" borderColor="gray.100" mb={6}>
              <Text fontWeight="bold" mb={2} color="gray.700">Selecciona un Grupo de Trabajo:</Text>
              <Select 
                placeholder="Elija un grupo de la lista para filtrar..." 
                size="lg"
                borderColor="red.200"
                _hover={{ borderColor: "red.400" }}
                focusBorderColor="red.500"
                value={grupoIdSeleccionado}
                onChange={(e) => setGrupoIdSeleccionado(e.target.value)}
                maxW="500px"
              >
                {listaGrupos.map((grupo) => (
                  <option key={grupo.id} value={grupo.id}>
                    {grupo.nombre}
                  </option>
                ))}
              </Select>
            </Box>

            <Box>
              {grupoIdSeleccionado ? (
                <Box bg="white" p={{ base: 6, md: 8 }} borderRadius="3xl" shadow="2xl" border="2px solid" borderColor="red.50">
                  <GraficaGrupos idGrupo={grupoIdSeleccionado} />
                </Box>
              ) : (
                <Center h="300px" bg="gray.50" borderRadius="3xl" border="2px dashed" borderColor="gray.200">
                  <Text color="gray.400" fontSize="lg" textAlign="center">
                    Por favor, selecciona un grupo arriba para desplegar su analítica detallada.
                  </Text>
                </Center>
              )}
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
