"use client";
import { Box, Heading, VStack, Text } from "@chakra-ui/react";
import type { ActivityItem } from "@/types/ActivityItem";

interface Props {
  actividades: ActivityItem[];
}

export default function EstadisticasHonores({ actividades }: { actividades: Props[] }) {
  const groupedByYear = actividades.reduce((acc, act) => {
    const year = new Date(act.date_start).getFullYear();
    acc[year] = (acc[year] || 0) + 1;
    return acc;
  }, {});

  const bestYear = Object.entries(groupedByYear).sort(
    (a, b) => b[1] - a[1]
  )[0];

  return (
    <Box bg="teal.50" p={6} borderRadius="lg">
      <Heading size="md" mb={4}>🏆 Honores</Heading>

      <VStack align="start">
        <Text>
          📅 Año con más actividades: <b>{bestYear?.[0]}</b> (
          {bestYear?.[1]} actividades)
        </Text>
      </VStack>
    </Box>
  );
}
