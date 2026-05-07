"use client";
import { SimpleGrid, Stat, StatLabel, StatNumber, Box } from "@chakra-ui/react";
import type { ActivityItem } from "@/types/ActivityItem";

interface Props {
  actividades: ActivityItem[];
}

export default function EstadisticasCards({ actividades }: { actividades: Props[] }) {
  const now = new Date();

  const total = actividades.length;
  const finalizadas = actividades.filter(
    (a) => new Date(a.date_end) < now
  ).length;
  const futuras = actividades.filter(
    (a) => new Date(a.date_start) > now
  ).length;

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
      <StatBox label="Actividades" value={total} />
      <StatBox label="Finalizadas" value={finalizadas} />
      <StatBox label="Futuras" value={futuras} />
      <StatBox label="Asistentes Totales" value="—" />
    </SimpleGrid>
  );
}

function StatBox({ label, value }) {
  return (
    <Box p={5} bg="white" shadow="md" borderRadius="lg">
      <Stat>
        <StatLabel>{label}</StatLabel>
        <StatNumber fontSize="3xl">{value}</StatNumber>
      </Stat>
    </Box>
  );
}
