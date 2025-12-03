// app/actividad/[activityId]/ActivityClientPage.tsx
"use client";

import { Box, Flex, Heading, Text, Image, VStack, Divider, Link as ChakraLink  } from "@chakra-ui/react";
import NextLink from "next/link";
import { mockActivityItems } from "@/data/actividadesMock";
import { mockGroupItems } from "@/data/gruposMock";

interface ActivityItem {
  id: number; // viene como string del mock
  title: string;
  image: string;
  description: string;
  date_start?: string;
  date_end?: string;
  place?: string;
  group?: string;
}

// Aseguramos el tipo:
const activities: ActivityItem[] = mockActivityItems;

export default function ActivityClientPage({ activityId }: { activityId: string }) {
  
  // Normalizamos ambos a string
  const id = String(activityId);

  const activity = activities.find((g) => String(g.id) === id);

  // Actividad no Encontrada
  if (!activity) {
    return (
      <Box maxW="4xl" mx="auto" p={10} textAlign="center">
        <Heading size="lg">Actividad no encontrada</Heading>
        <Text mt={4}>No existe una actividad con el ID {activityId}.</Text>
      </Box>
    );
  }


let linkedGroup = null;

  if (activity.group) {
    linkedGroup = mockGroupItems.find(
      (g) => g.title.trim().toLowerCase() === activity.group!.trim().toLowerCase()
    );
  }

  {/* Pagina del Actividad */}

  return (
    <Box maxW="6xl" mx="auto" p={8} my={8} bg="white" rounded="lg" shadow="xl">
      <VStack spacing={12} align="stretch">

        {/* Imagen + Info */}
        <Flex
          direction={{ base: "column", md: "row" }}
          align="top"
          gap={10}
        >
          {/* Imagen */}
          <Image
            src={activity.image}
            alt={activity.title}
            w="500px"
            h="300px"
            objectFit="cover"
            borderRadius="2xl"
            shadow="lg"
          />

          {/* Info básica */}
          <VStack align="start" spacing={3} flex="1" alignItems="center">
            <Heading size="2xl" color="teal.700">
              {activity.title}
            </Heading>

            {activity.group && (
              <Text fontSize="xl" color="gray.600">
                <strong>Grupo:</strong>{" "}
                {linkedGroup ? (
                  <ChakraLink
                    as={NextLink}
                    href={`/grupo/${linkedGroup.id}`}
                    color="teal.500"
                    _hover={{ textDecoration: "underline", color: "teal.600" }}
                  >
                    {activity.group}
                  </ChakraLink>
                ) : (
                  activity.group
                )}
              </Text>
            )}

            {activity.date_start && (
              <Text fontSize="lg" color="gray.500">
                {activity.date_start === activity.date_end
                    ? `📅 Fecha: ${activity.date_start}`
                    : `📅 Fecha: Desde el ${activity.date_start} al ${activity.date_end}`}
              </Text>
            )}

            {activity.place && (
              <Text fontSize="lg" color="gray.500">
                📍 {activity.place}
              </Text>
            )}
          </VStack>
        </Flex>

        <Divider />

        {/* Descripción */}
        <Box>
          <Heading size="lg" mb={4} color="teal.600">
            Descripción
          </Heading>

          <Text fontSize="lg" color="gray.700">
            {activity.description}
          </Text>
        </Box>

      </VStack>
    </Box>
  );
}
