"use client";
import React, { useState } from 'react';
import { Box, Heading, Flex, Button, Text, Center, Spinner, Badge } from "@chakra-ui/react";
import { useAuth } from "@/app/context/auth-context";
import { useActividadesAdmin } from "@/components/ui/estadisticas/separarAdmin"; // Tu nuevo hook
import { 
  SimpleBarCharts, StackedAreaCharts, SimpleRadarChart, 
  SimpleBarCharts1, DoublePieChart 
} from "@/components/ui/estadisticas/graficas";

const CONFIG_GRAFICAS: Record<number, any> = {
  1: { titulo: "Participación Global", Componente: SimpleBarCharts, dataKey: "porTitulo", props: { valorx: "title", valory: "numero_a_beneficiar", valory2: "numero_beneficiados" } },
  2: { titulo: "Sedes y Ubicaciones", Componente: SimpleBarCharts1, dataKey: "porCiudad", props: { valorx: "ciudad", valory: "cantidadDeVeces" } },
  3: { titulo: "Desempeño por Grupos", Componente: SimpleBarCharts, dataKey: "porGrupo", props: { valorx: "group", valory: "cantidadReal" } }, // Nueva para Admin
  4: { titulo: "Alcance por País", Componente: StackedAreaCharts, dataKey: "porPais", props: { valorx: "pais", valory: "cantidadEsperada", valory2: "cantidadReal" } },
  5: { titulo: "Consolidado Real vs Meta", Componente: DoublePieChart, dataKey: "porPais", props: { valorx: "pais", valory: "cantidadReal", valory2: "cantidadEsperada" } }
};

export default function DashboardAdmin() {
  const [graficaActiva, setGraficaActiva] = useState(1);
  const { isHydrated } = useAuth();
  const datosCalculados = useActividadesAdmin();

  if (!isHydrated) return <Center h="100vh"><Spinner color="red.500" size="xl" /></Center>;

  const renderGraficaActual = () => {
    const config = CONFIG_GRAFICAS[graficaActiva];
    const datosFinales = (datosCalculados as any)[config.dataKey] || [];

    if (datosFinales.length === 0) {
      return <Center h="400px"><Text color="gray.500">No hay datos en el sistema.</Text></Center>;
    }

    return <config.Componente datos={datosFinales} {...config.props} />;
  };

  return (
    <Box p={{ base: 4, md: 10 }} maxW="1400px" mx="auto">
      <Box mb={10}>
        <Flex align="center" gap={3}>
          <Heading size="2xl" fontWeight="black">Panel de Control Maestro</Heading>
          <Badge colorScheme="red" fontSize="0.8em" borderRadius="full" px={3}>ADMIN</Badge>
        </Flex>
        <Text color="gray.500">Visualizando métricas consolidadas de todos los grupos y sedes.</Text>
      </Box>

      <Flex wrap="wrap" gap={3} mb={12}>
        {Object.entries(CONFIG_GRAFICAS).map(([id, config]) => (
          <Button
            key={id}
            onClick={() => setGraficaActiva(Number(id))}
            variant={graficaActiva === Number(id) ? "solid" : "outline"}
            colorScheme="red" // Color distinto para diferenciar de la vista de usuario
            borderRadius="full"
            size="sm"
          >
            {config.titulo}
          </Button>
        ))}
      </Flex>

      <Box bg="white" p={8} borderRadius="3xl" shadow="2xl" border="2px solid" borderColor="red.50">
        <Heading size="lg" mb={8} color="gray.700">{CONFIG_GRAFICAS[graficaActiva]?.titulo}</Heading>
        <Box w="100%" h="550px">{renderGraficaActual()}</Box>
      </Box>
    </Box>
  );
}