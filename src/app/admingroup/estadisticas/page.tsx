"use client";
import React, { useState } from 'react';
import { Box, Heading, Flex, Button, Text, Center, Spinner } from "@chakra-ui/react";
import { useAuth } from "@/app/context/auth-context";
import { useActividades } from "@/components/ui/estadisticas/separar";
import { 
  SimpleBarCharts, StackedAreaCharts, SimpleRadarChart, 
  SimpleBarCharts1, DoublePieChart 
} from "@/components/ui/estadisticas/graficas";

// Configuración de las gráficas
const CONFIG_GRAFICAS: Record<number, any> = {
  1: { titulo: "Participantes por Actividad", Componente: SimpleBarCharts, dataKey: "porTitulo", props: { valorx: "title", valory: "numero_a_beneficiar", valory2: "numero_beneficiados" } },
  2: { titulo: "Actividades por Ciudad", Componente: SimpleBarCharts1, dataKey: "porCiudad", props: { valorx: "ciudad", valory: "cantidadDeVeces" } },
  3: { titulo: "Tendencia por País", Componente: StackedAreaCharts, dataKey: "porPais", props: { valorx: "pais", valory: "cantidadEsperada", valory2: "cantidadReal" } },
  4: { titulo: "Actividades por Estado", Componente: SimpleBarCharts, dataKey: "porCapital", props: { valorx: "capital", valory: "numero_a_beneficiar", valory2: "numero_beneficiados" } },
  5: { titulo: "Integrantes por Actividad", Componente: SimpleBarCharts1, dataKey: "porTitulo", props: { valorx: "title", valory: "integrantes" } },
  6: { titulo: "Total de intgrantes por Ciudad", Componente: SimpleBarCharts1, dataKey: "porCiudad", props: { valorx: "ciudad", valory: "integrantes" } }
};

export default function DashboardEstadisticas() {
  const [graficaActiva, setGraficaActiva] = useState(1);
  const { user, isHydrated } = useAuth();
  

  const grupoIdentificado = (user?.group || user?.name || "Sin Grupo");
  const datosCalculados = useActividades(isHydrated ? grupoIdentificado : "");


  if (!isHydrated) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Center>
    );
  }

  const renderGraficaActual = () => {
    const config = CONFIG_GRAFICAS[graficaActiva];
    // Acceso dinámico a los datos agrupados (porCiudad, porPais, etc)
    const datosFinales = (datosCalculados as any)[config.dataKey] || [];

    if (datosFinales.length === 0) {
      return (
        <Center h="400px">
          <Text color="gray.500">No hay datos disponibles para el grupo: {grupoIdentificado}</Text>
        </Center>
      );
    }

    return <config.Componente datos={datosFinales} {...config.props} />;
  };

  return (
    <Box p={{ base: 4, md: 10 }} maxW="1400px" mx="auto">
      <Box mb={10}>
        <Heading size="2xl" fontWeight="black" letterSpacing="tight">
          Visualizador de Reportes
        </Heading>
        <Text fontSize="lg" color="gray.500">
          Datos filtrados por: <strong>{grupoIdentificado}</strong>
        </Text>
      </Box>

      {/* Selector de Gráficas */}
      <Flex wrap="wrap" gap={3} mb={12}>
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

      {/* Contenedor del Gráfico */}
      <Box 
        bg="white" 
        p={{ base: 4, md: 8 }} 
        borderRadius="3xl" 
        shadow="2xl" 
        border="1px solid" 
        borderColor="gray.100"
      >
        <Heading size="lg" mb={8} color="gray.700">
          {CONFIG_GRAFICAS[graficaActiva]?.titulo}
        </Heading>
        <Box w="100%" h="550px">
          {renderGraficaActual()}
        </Box>
      </Box>
    </Box>
  );
}