"use client";

import { useState, useEffect } from "react";
import { Box, Flex, Image, Text, VStack, Grid, Badge, Stack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import { PrimaryButton, SecondaryButton } from "@/components/ui/buttons";

interface Activity {
  id: number;
  title: string;
  description: string;
  image: string;
  date_start: string;
  date_end: string;
  place: string;
  group: string;
  area: string[];
}

interface CarouselProps {
  activities: Activity[];
}

export default function Carousel({ activities }: CarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const router = useRouter();

  function normalizeDate(date: Date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function parseLocalDate(dateStr: string) {
    if (!dateStr) return new Date();
    if (dateStr.includes("/")) {
      const [d, m, y] = dateStr.split("/").map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date(dateStr);
  }

  const today = normalizeDate(new Date());

  const upcomingOrOngoing = activities.filter((item) => {
    const start = normalizeDate(parseLocalDate(item.date_start));
    const end = normalizeDate(parseLocalDate(item.date_end));
    return start > today || (start <= today && end >= today);
  });

  // Ordenamiento adicional defensivo por fecha
  upcomingOrOngoing.sort((a, b) => (a.date_start > b.date_start ? 1 : -1));

  let items = upcomingOrOngoing.slice(0, 5);

  const placeholder: Activity = {
    id: -1,
    title: "Próximas Actividades Universitarias",
    description: "Mantente al tanto de las actividades de extensión e impacto social organizadas por nuestros grupos.",
    image: "/image-1.png",
    date_start: "",
    date_end: "",
    place: "Universidad Central de Venezuela",
    group: "",
    area: [],
  };

  if (items.length === 0) items = [placeholder];

  const length = items.length;

  useEffect(() => {
    if (paused || length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % length);
    }, 4500);
    return () => clearInterval(interval);
  }, [paused, length]);

  return (
    <Box maxW="container.xl" mx="auto" px={0} py={6}>
      <Grid
        templateColumns={{ base: "1fr", lg: "1.5fr 1fr" }}
        gap={8}
        alignItems="stretch"
      >
        {/* COLUMNA 1: CARRUSEL CON EFECTO FADE */}
        <Box
          position="relative"
          minH={{ base: "500px", md: "580px" }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {items.map((item, i) => {
            const isActive = i === index;
            return (
              <Box
                key={item.id !== -1 ? item.id : `placeholder-${i}`}
                position={isActive ? "relative" : "absolute"}
                top={0}
                left={0}
                w="100%"
                h="100%"
                opacity={isActive ? 1 : 0}
                visibility={isActive ? "visible" : "hidden"}
                transition="opacity 0.8s ease-in-out, visibility 0.8s ease-in-out"
                bg="white"
                borderRadius="2xl"
                overflow="hidden"
                boxShadow="2xl"
                border="1px solid"
                borderColor="gray.100"
                display="flex"
                flexDirection="column"
              >
                {/* Imagen superior */}
                <Box position="relative" w="100%" h={{ base: "220px", md: "300px" }} overflow="hidden" bg="gray.100">
                  <Image
                    src={item.image}
                    alt={item.title}
                    w="100%"
                    h="100%"
                    objectFit="cover"
                    fallbackSrc="/imagen-no-disponible.jpg"
                  />
                  {item.group && (
                    <Badge
                      position="absolute"
                      top={4}
                      left={4}
                      bg="primary"
                      color="white"
                      px={3}
                      py={1}
                      borderRadius="full"
                      fontSize="xs"
                      textTransform="uppercase"
                      boxShadow="md"
                    >
                      {item.group}
                    </Badge>
                  )}
                </Box>

                {/* Contenido / Data inferior */}
                <VStack align="flex-start" justify="space-between" flex={1} p={{ base: 6, md: 8 }} spacing={4}>
                  <VStack align="flex-start" spacing={2} w="100%">
                    {item.id !== -1 && (
                      <Text fontSize="xs" fontWeight="bold" color="secondary" textTransform="uppercase" letterSpacing="wider">
                        📅 {item.date_start === item.date_end ? item.date_start : `${item.date_start} al ${item.date_end}`} — 📍 {item.place}
                      </Text>
                    )}

                    <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="extrabold" color="gray.800" lineHeight="tight">
                      {item.title}
                    </Text>

                    <Text fontSize="md" color="gray.600" noOfLines={3}>
                      {item.description}
                    </Text>
                  </VStack>

                  {item.id !== -1 && (
                    <PrimaryButton
                      size="md"
                      onClick={() => router.push(`/actividad/${item.id}`)}
                    >
                      Ver detalles de la actividad
                    </PrimaryButton>
                  )}
                </VStack>
              </Box>
            );
          })}
        </Box>

        {/* COLUMNA 2: BANNER Y BOTÓN DE ACTIVIDADES */}
        <Box
          position="relative"
          borderRadius="2xl"
          overflow="hidden"
          boxShadow="xl"
          minH={{ base: "320px", lg: "auto" }}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          p={{ base: 8, md: 12 }}
          textAlign="center"
        >
          {/* Fondo con imagen y overlay de color institucional */}
          <Box
            position="absolute"
            top={0}
            left={0}
            w="100%"
            h="100%"
            backgroundImage="url('/background-1.jpg')"
            backgroundSize="cover"
            backgroundPosition="center"
            filter="brightness(0.6)"
            zIndex={0}
          />
          <Box
            position="absolute"
            top={0}
            left={0}
            w="100%"
            h="100%"
            bg="linear-gradient(135deg, rgba(1, 143, 124, 0.85) 0%, rgba(1, 105, 91, 0.95) 100%)"
            zIndex={1}
          />

          <VStack zIndex={2} spacing={6} maxW="400px">
            <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="black" color="white" lineHeight="shorter">
              Explora la lista completa de actividades
            </Text>
            <Text fontSize="sm" color="whiteAlpha.900">
              Descubre talleres, conferencias, jornadas y otras actividades realizadas por los Grupos de Extensión de la UCV.
            </Text>
            <NextLink href="/actividades" passHref>
              <SecondaryButton size="lg" px={8}>
                Ver todas las actividades
              </SecondaryButton>
            </NextLink>
          </VStack>
        </Box>
      </Grid>
    </Box>
  );
}