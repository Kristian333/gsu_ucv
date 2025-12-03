// app/grupo/[groupId]/GroupClientPage.tsx
"use client";

import { Box, Flex, Heading, Text, Image, VStack, Divider } from "@chakra-ui/react";
import NextLink from "next/link";
import { mockGroupItems } from "@/data/gruposMock";
import { mockActivityItems } from "@/data/actividadesMock";

interface GroupItem {
  id: string;
  title: string;
  image: string;
  objetive: string;
  fundation?: string;
  email?: string;
  phone?: string;
  faculty?: string;
}

// Aseguramos el tipo:
const groups: GroupItem[] = mockGroupItems;

export default function GroupClientPage({ groupId }: { groupId: string }) {
  
  // Normalizamos ambos a string
  const id = String(groupId);

  const group = groups.find((g) => String(g.id) === id);

  // Grupo no Encontrado
  if (!group) {
    return (
      <Box maxW="4xl" mx="auto" p={10} textAlign="center">
        <Heading size="lg">Grupo no encontrado</Heading>
        <Text mt={4}>No existe un grupo con el ID {groupId}.</Text>
      </Box>
    );
  }

  const activitiesForGroup = mockActivityItems
      .filter((a) => a.group === group.title)
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
  
  {/* Pagina del Grupo */}
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
            src={group.image}
            alt={group.title}
            w="300px"
            h="auto"
            objectFit="cover"
            borderRadius="2xl"
            border="5px solid"
            borderColor="primary"
            shadow="lg"
          />

          {/* Info básica */}
          <VStack align="start" spacing={3} flex="1" alignItems="center">
            <Heading size="2xl" color="teal.700">
              {group.title}
            </Heading>

            {group.faculty && (
              <Text fontSize="xl" color="gray.600">
                <strong>Facultad:</strong> {group.faculty}
              </Text>
            )}

            {group.email && (
              <Text fontSize="lg" color="gray.500">
                📧 Email de contacto: {group.email}
              </Text>
            )}

            {group.phone && (
              <Text fontSize="lg" color="gray.500">
                📱 Número de contacto: {group.phone}
              </Text>
            )}

            {group.fundation && (
              <Text fontSize="lg" color="gray.500">
                📅 Fundado en {group.fundation}
              </Text>
            )}
          </VStack>
        </Flex>

        <Divider />

        {/* Objetivo */}
        <Box>
          <Heading size="lg" mb={4} color="teal.600">
            Objetivo
          </Heading>

          <Text fontSize="lg" color="gray.700">
            {group.objetive}
          </Text>
        </Box>

        <Divider />

        {/* Actividades Destacadas */}
        <Box>
          <Heading size="lg" mb={4} color="teal.600">
            Actividades Destacadas
          </Heading>

          {/* Actividades aqui*/}
          <Flex gap={6} wrap="wrap">
            {activitiesForGroup.length === 0 && (
              <Text color="gray.500">Este grupo no tiene actividades registradas.</Text>
            )}

            {activitiesForGroup.map((activity) => (
              <NextLink
                key={activity.id}
                href={`/actividad/${activity.id}`}
                style={{ textDecoration: "none" }}
              >
                <Box
                  w="250px"
                  rounded="xl"
                  overflow="hidden"
                  border="1px solid #e0e0e0"
                  bg="white"
                  transition="all 0.25s ease"
                  _hover={{
                    transform: "translateY(-6px)",
                    shadow: "xl",
                    cursor: "pointer",
                  }}
                >
                  <Image
                    src={activity.image}
                    alt={activity.title}
                    w="100%"
                    h="200px"
                    objectFit="cover"
                  />

                  <Box p={4}>
                    <Heading size="md" color="teal.700" textAlign="center">
                      {activity.title}
                    </Heading>
                  </Box>
                </Box>
              </NextLink>
            ))}
          </Flex>
        </Box>

        {/* Galeria */}
        <Box>
          <Heading size="lg" mb={4} color="teal.600">
            Galería
          </Heading>

          {/* Galeria aqui*/}

        </Box>

      </VStack>
    </Box>
  );
}
