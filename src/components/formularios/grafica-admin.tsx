"use client";
import React, { useState, useEffect } from 'react';
import { 
  Box, Heading, Flex, Button, Text, Center, Spinner, Badge, useToast,
  Tabs, TabList, TabPanels, Tab, TabPanel, Select 
} from "@chakra-ui/react";
import { useAuth } from "@/app/context/auth-context";
import { apiRequest } from "@/components/formularios/api";
import { useActividades, ActividadBackend } from "@/components/ui/estadisticas/separar";
import { SimpleBarCharts, SimpleBarCharts1, GraficaAreasPorAnio } from "@/components/ui/estadisticas/graficas";

import GraficaGrupos from "./graficas-grupos"; 

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

interface GrupoBackend {
  id: string;
  nombre: string;
  descripcion?: string;
  facultad?: string;
}

const CONFIG_GRAFICAS: Record<number, ConfigGrafica> = {
  1: { 
    titulo: "Participantes Reales vs Estimados ", 
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
    titulo: "Total de participanetes reales vs estmiados  por Grupos", 
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
    titulo: "Histórico de Actividades Ejecutadas por Año ", 
    Componente: SimpleBarCharts1, 
    dataKey: "porAnio", 
    props: { valorx: "lugar", valory: "CantidadReal", nombreLeyenda: "Cantidad de Actividades" } 
  },
  6: { 
    titulo: "Distribución Global de Áreas de Conocimiento por Año", 
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

  const [listaGrupos, setListaGrupos] = useState<GrupoBackend[]>([]);
  const [grupoIdSeleccionado, setGrupoIdSeleccionado] = useState<string>("");

  const datosCalculados = useActividades(actividadesRaw);

  useEffect(() => {
    if (!isHydrated) return;

    const cargarDatosDashboard = async () => {
      try {
        setLoadingBackend(true);
        const token = localStorage.getItem("token") || "";
        
        const [resActividades, resGrupos] = await Promise.all([
          apiRequest("activities?page=1&per_page=99999", {
            method: 'GET',
            headers: { "Authorization": `Bearer ${token}` }
          }),
          apiRequest("groups?page=1&per_page=99999", {
            method: 'GET',
            headers: { "Authorization": `Bearer ${token}` }
          })
        ]);

        if (resActividades) {
          if (resActividades.actividades) {
            setActividadesRaw(resActividades.actividades);
          } else if (Array.isArray(resActividades)) {
            setActividadesRaw(resActividades);
          }
        }

        if (resGrupos) {
          if (resGrupos.grupos && Array.isArray(resGrupos.grupos)) {
            setListaGrupos(resGrupos.grupos);
          } else if (Array.isArray(resGrupos)) {
            setListaGrupos(resGrupos);
          }
        }

      } catch (error: any) {
        toast({
          title: "Fallo de sincronización general",
          description: error.message || "No se pudieron obtener los datos del sistema.",
          status: "error",
          duration: 6000,
          isClosable: true,
          position: "top"
        });
      } finally {
        setLoadingBackend(false);
      }
    };

    cargarDatosDashboard();
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
          <Text color="gray.500">No hay datos históricos suficientes en el sistema para generar este reporte.</Text>
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
      <Box mb={8}>
        <Flex align="center" gap={3}>
          <Heading size="2xl" fontWeight="black" letterSpacing="tight">
            Estadísticas Generales de los Grupos
          </Heading>
          <Badge colorScheme="red" fontSize="0.8em" borderRadius="full" px={3} py={0.5}>
            ADMIN
          </Badge>
        </Flex>
        <Text fontSize="lg" color="gray.500" mt={1}>
          Visualizando métricas consolidadas de todos los grupos, áreas y sedes universitarias a nivel nacional con paginación extendida.
        </Text>
      </Box>

      <Tabs variant="enclosed" colorScheme="red">
        <TabList mb={6}>
          <Tab fontWeight="bold">Métricas Globales</Tab>
          <Tab fontWeight="bold">Análisis por Grupo Específico</Tab>
        </TabList>

        <TabPanels>
          <TabPanel p={0}>
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
