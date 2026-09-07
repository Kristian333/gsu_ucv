// src/components/admin/deu-dashboard-client.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Spinner,
  Center,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Stack,
  Flex,
  Icon,
  Link as ChakraLink,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { FaArrowRight } from "react-icons/fa";
import { useAuth } from "@/app/context/auth-context";
import { apiRequest } from "@/components/formularios/api";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { DeuDashboardResponse } from "@/types/dashboard";

export function DeuDashboardClient() {
  const { user, isHydrated } = useAuth();
  const [stats, setStats] = useState<DeuDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isHydrated) return;

    apiRequest("admin/group_dashboards/deu")
      .then((res: DeuDashboardResponse) => setStats(res))
      .catch((err) => console.error("Error al obtener dashboard DEU:", err))
      .finally(() => setLoading(false));
  }, [isHydrated]);

  if (!isHydrated || loading) {
    return (
      <Center h="60vh">
        <Spinner size="xl" color="secondary.500" />
      </Center>
    );
  }

  return (
    <Box maxW="container.xl" mx="auto" py={10} px={6}>
      <Heading as="h1" size="xl" color="gray.700">
        Panel de Dirección de Extensión Universitaria (DEU)
      </Heading>
      <Text mt={2} color="gray.600">
        Bienvenido, <b>{user?.name}</b>. A continuación se presenta el resumen general del sistema.
      </Text>

      {/* Tarjetas de Métricas Principales */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} mt={8}>
        <DashboardCard
          title="Solicitudes Pendientes DEU"
          description="Revisiones de creación/actualización de grupos bajo la gestión directiva."
          tags={[
            {
              count: stats?.solicitudes_pendientes_deu ?? 0,
              label: "pendientes",
              colorScheme: "red",
            },
          ]}
          link="/admin/solicitudes?tab=groups&page=1"
          linkText="Ver solicitudes"
        />

        <DashboardCard
          title="Grupos de Extensión"
          description="Total de agrupaciones de extensión vigentes e inactivas."
          tags={[
            {
              count: stats?.grupos_activos_totales ?? 0,
              label: "activos",
              colorScheme: "green",
            },
            {
              count: stats?.grupos_inactivos_totales ?? 0,
              label: "inactivos",
              colorScheme: "red",
            },
          ]}
          link="/admin/grupos"
          linkText="Gestionar grupos"
        />
      </SimpleGrid>

      {/* Desglose de Solicitudes de Recursos por Facultad */}
      <Box
        mt={10}
        p={6}
        bg="white"
        borderRadius="lg"
        border="1px solid"
        borderColor="gray.200"
        shadow="sm"
      >
        <Stack spacing={4}>
          <Flex align="center" justify="space-between">
            <Box>
              <Heading size="md" color="gray.700">
                Solicitudes de Recursos Pendientes
              </Heading>
              <Text fontSize="sm" color="gray.500" mt={1}>
                Desglose de requerimientos pendientes por parte de las distintas facultades.
              </Text>
            </Box>

            <NextLink href="/admin/solicitudes?tab=resources&page=1" passHref legacyBehavior>
              <ChakraLink color="secondary.500" fontWeight="bold" fontSize="sm" _hover={{ textDecoration: "underline" }}>
                <Flex align="center">
                  Ver solicitudes de recursos
                  <Icon as={FaArrowRight} ml={2} />
                </Flex>
              </ChakraLink>
            </NextLink>
          </Flex>

          {stats?.solicitudes_recursos_por_facultad &&
          stats.solicitudes_recursos_por_facultad.length > 0 ? (
            <Table variant="simple" mt={4}>
              <Thead bg="gray.50">
                <Tr>
                  <Th>Facultad</Th>
                  <Th isNumeric>Solicitudes Pendientes</Th>
                </Tr>
              </Thead>
              <Tbody>
                {stats.solicitudes_recursos_por_facultad.map((item, index) => (
                  <Tr key={index}>
                    <Td fontWeight="medium">
                      <NextLink
                        href={`/admin/solicitudes?tab=resources&page=1&faculty=${encodeURIComponent(item.facultad)}`}
                        passHref
                        legacyBehavior
                      >
                        <ChakraLink color="secondary.600" _hover={{ textDecoration: "underline" }}>
                          {item.facultad}
                        </ChakraLink>
                      </NextLink>
                    </Td>
                    <Td isNumeric>
                      <Badge colorScheme="red" px={3} py={1} borderRadius="full">
                        {item.solicitudes}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <Text color="gray.400" fontSize="sm" mt={2}>
              No hay solicitudes de recursos pendientes por facultad.
            </Text>
          )}
        </Stack>
      </Box>
    </Box>
  );
}