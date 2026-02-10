"use client";

import { useMemo, useState } from "react";
import { Box, Heading, VStack } from "@chakra-ui/react";
import EstadisticasFiltro from "./EstadisticasFiltro";
import EstadisticasCards from "./EstadisticasCards";
import EstadisticasHonores from "./EstadisticasHonores";
import EstadisticasGraficas from "./EstadisticasGraficas";
import type { ActivityItem } from "@/types/ActivityItem";

interface Props {
  actividades: ActivityItem[];
}

export default function Estadisticas({ actividades }: { actividades: Props[] }) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number | "all">(currentYear);

  // años disponibles según actividades
  const availableYears = useMemo(() => {
    const years = actividades.map((a) =>
      new Date(a.date_start).getFullYear()
    );
    return Array.from(new Set(years)).sort();
  }, [actividades]);

  const filteredActivities = useMemo(() => {
    if (year === "all") return actividades;
    return actividades.filter(
      (a) => new Date(a.date_start).getFullYear() === year
    );
  }, [year, actividades]);

  return (
    <Box p={8}>
      <Heading mb={6}>Estadísticas del Grupo</Heading>

      <VStack spacing={8} align="stretch">
        <EstadisticasFiltro
          year={year}
          setYear={setYear}
          years={availableYears}
        />

        <EstadisticasCards activities={filteredActivities} />

        <EstadisticasHonores activities={actividades} />

        <EstadisticasGraficas activities={actividades} />
      </VStack>
    </Box>
  );
}
