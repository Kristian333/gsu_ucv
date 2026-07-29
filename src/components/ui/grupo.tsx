// app/grupo/[groupId]/GroupClientPage.tsx
"use client";

import { Box, Flex, Heading, Text, Image, VStack, Divider } from "@chakra-ui/react";
import NextLink from "next/link";
import React, { useState } from "react";

export interface GroupItem {
  id: string;
  title: string;
  image: string;
  objetive: string;
  foundation?: string;
  email?: string;
  phone?: string;
  faculty?: string;
  awards?: { awardName: string; awarddate: number }[] | string;
}

export interface ActivityItem {
  id: string | number;
  title: string;
  image: string;
  group: string;
}

interface Props {
  groupId: string;
  group: GroupItem;
  activities: ActivityItem[];
}

export default function GroupClientPage({ groupId, group, activities }: Props) {
  const awards = Array.isArray(group.awards)
    ? [...group.awards].sort((a, b) => b.awarddate - a.awarddate)
    : [];
  
  const [showAllAwards, setShowAllAwards] = useState(false);
  
  {/* Pagina del Grupo */}
  return (
    <Box maxW="6xl" mx="auto" p={8} my={8} bg="white" rounded="lg" shadow="xl">
      <VStack spacing={12} align="stretch">

        {/* Imagen + Info */}
        <Flex direction={{ base: "column", md: "row" }} align="top" gap={10}>
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
            fallbackSrc="/imagen-no-disponible.jpg"
          />

          {/* Info básica */}
          <VStack align="start" spacing={3} flex="1" alignItems="center">
            <Heading size="2xl" color="primary" alignSelf="center" textAlign="center">
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

            {group.foundation && (
              <Text fontSize="lg" color="gray.500">
                📅 Fundado en {group.foundation}
              </Text>
            )}
          </VStack>
        </Flex>

        <Divider />

        {/* Objetivo */}
        <Box>
          <Heading size="lg" mb={4} color="primary">
            Objetivo
          </Heading>

          <Text fontSize="lg" color="gray.700">
            {group.objetive}
          </Text>
        </Box>

        <Divider />

        {/* Actividades Destacadas */}
        <Box>
          <Heading size="lg" mb={4} color="primary">
            Actividades Destacadas
          </Heading>

          {/* Actividades aqui*/}
          <Flex gap={6} wrap="wrap">
            {activities.length === 0 && (
              <Text color="gray.500">Este grupo no tiene actividades registradas actualmente.</Text>
            )}

            {activities.map((activity) => (
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
                    fallbackSrc="/imagen-no-disponible.jpg"
                  />

                  <Box p={4}>
                    <Heading size="md" color="primary" textAlign="center">
                      {activity.title}
                    </Heading>
                  </Box>
                </Box>
              </NextLink>
            ))}
          </Flex>
        </Box>

        {awards.length > 0 && (
          <>
            <Divider />

            {/* Reconocimientos */}
            <Box>
              <Heading size="lg" mb={4} color="primary">
                Reconocimientos
              </Heading>
              <Flex gap={5} wrap="wrap">
                {awards
                  .slice(0, showAllAwards ? awards.length : 10)
                  .map((award, idx) => (
                  <Box
                    key={idx}
                    w="200px"
                    rounded="xl"
                    overflow="hidden"
                    bg="white"
                    p={3}
                    textAlign="center"
                  >
                    <Image
                      src="/award-medal.png"
                      alt={award.awardName}
                      w="120px"
                      h="120px"
                      mx="auto"
                    />
                    <Text mt={2} fontSize="md">
                      <strong>{award.awardName}</strong>
                    </Text>
                    <Text mt={2} fontSize="md">
                      {award.awarddate}
                    </Text>
                  </Box>
                ))}
              </Flex>
              
              {/* Botón Ver más / Ver menos */}
              {awards.length > 10 && (
                <Box textAlign="center" mt={4}>
                  <button
                    onClick={() => setShowAllAwards(!showAllAwards)}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "8px",
                      color: "white",
                      border: "1px solid #ccc",
                      background: "#2E5796",
                      cursor: "pointer",
                    }}
                  >
                    {showAllAwards ? "↑ Ver Menos ↑" : "↓ Ver Más ↓"}
                  </button>
                </Box>
              )}
            </Box>
          </>
        )}

      </VStack>
    </Box>
  );
}
