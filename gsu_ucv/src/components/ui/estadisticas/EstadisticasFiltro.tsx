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

export default function Estadisticas({ actividades }: Props) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number | "all">(currentYear);

  const safeActivities = actividades ?? [];

  // años disponibles según actividades
  const availableYears = useMemo(() => {
    const years = safeActivities.map((a) =>
      new Date(a.date_start).getFullYear()
    );
    return Array.from(new Set(years)).sort();
  }, [safeActivities]);

  const filteredActivities = useMemo(() => {
    if (year === "all") return safeActivities;
    return safeActivities.filter(
      (a) => new Date(a.date_start).getFullYear() === year
    );
  }, [year, safeActivities]);

  return (
    <Box p={8}>
      <Heading mb={6}>Estadísticas del Grupo</Heading>

      <VStack spacing={8} align="stretch">
        <EstadisticasFiltro
          year={year}
          setYear={setYear}
          years={availableYears}
        />

        <EstadisticasCards actividades={filteredActivities} />

        <EstadisticasHonores actividades={safeActivities} />

        <EstadisticasGraficas actividades={safeActivities} />
      </VStack>
    </Box>
  );
}
