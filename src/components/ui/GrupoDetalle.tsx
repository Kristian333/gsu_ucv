"use client";

import {
  Box,
  Heading,
  Text,
  Image,
  VStack,
  HStack,
  Badge,
  Divider,
  SimpleGrid,
} from "@chakra-ui/react";

interface Award {
  awardName: string;
  awarddate: number;
}

interface GroupItem {
  id: string;
  title: string;
  image: string;
  objetive: string;
  fundation: string;
  phone: string;
  email: string;
  type: string;
  faculty: string;
  awards: Award[] | "";
}

export default function GrupoDetalle({ grupo }: { grupo: GroupItem | null }) {
  if (!grupo) {
    return (
      <Box p={10} textAlign="center">
        <Heading size="lg">Grupo no encontrado</Heading>
        <Text mt={4}>El grupo solicitado no existe.</Text>
      </Box>
    );
  }

  const hasAwards = Array.isArray(grupo.awards) && grupo.awards.length > 0;

  return (
    <Box maxW="6xl" mx="auto" p={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <HStack spacing={6} align="center">
          <Image
            src={grupo.image}
            alt={grupo.title}
            boxSize="150px"
            objectFit="cover"
            borderRadius="xl"
            shadow="md"
          />

          <Box>
            <Heading size="2xl">{grupo.title}</Heading>
            <Text color="gray.500">
              Fundación: {grupo.fundation}
            </Text>
          </Box>
        </HStack>

        <Divider />

        {/* Información básica */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <Box>
            <Heading size="md" mb={2}>Objetivo</Heading>
            <Text>{grupo.objetive}</Text>
          </Box>

          <VStack align="start" spacing={2}>
            <Text><strong>Email:</strong> {grupo.email}</Text>
            <Text><strong>Teléfono:</strong> {grupo.phone}</Text>
            <Text><strong>Facultad:</strong> {grupo.faculty || "—"}</Text>
            <Text><strong>Tipo:</strong> {grupo.type || "—"}</Text>
          </VStack>
        </SimpleGrid>

        <Divider />

        {/* Premios */}
        <Box>
          <Heading size="md" mb={4}>Reconocimientos</Heading>

          {hasAwards ? (
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              {(grupo.awards as Award[]).map((award, index) => (
                <Box
                  key={index}
                  p={4}
                  borderWidth="1px"
                  borderRadius="lg"
                  bg="gray.50"
                >
                  <Text fontWeight="bold">{award.awardName}</Text>
                  <Badge mt={2} colorScheme="teal">
                    {award.awarddate}
                  </Badge>
                </Box>
              ))}
            </SimpleGrid>
          ) : (
            <Text color="gray.500">Este grupo no tiene reconocimientos registrados.</Text>
          )}
        </Box>
      </VStack>
    </Box>
  );
}
