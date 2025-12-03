"use client";

import { useState, useEffect } from "react";
import { Box, Flex, IconButton, Image, Text } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { useRouter } from "next/navigation";
import { mockActivityItems } from "@/data/actividadesMock";

export default function Carousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const router = useRouter();


  function normalizeDate(date: Date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function parseLocalDate(dateStr: string) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d); // <-- esto es local siempre
  }

  const today = normalizeDate(new Date());

  // Filtrar, ordenar y limitar los items. Solo actividades futuras
  const upcomingOrOngoing = mockActivityItems.filter(item => {
    const start = normalizeDate(parseLocalDate(item.date_start));
    const end = normalizeDate(parseLocalDate(item.date_end));

    /*
        - Futuro: start > hoy
        - En curso: start <= hoy <= end
        - Pasado: end < hoy (se excluye)
    */
    return start > today || (start <= today && end >= today);
  });

  // Ordenar en curso + futuros por fecha de inicio ASC (más próximo primero)
  upcomingOrOngoing.sort((a, b) => (a.date_start > b.date_start ? 1 : -1));

  // Limitar a 5 elementos
  let items = upcomingOrOngoing.slice(0, 5);

  // Placeholder si no hay actividades futuras
  const placeholder = {
    id: -1,
    title: "Bienvenido a la Gestión Social Universitaria",
    description: "Descubre nuestros grupos de extensión y sus próximas actividades",
    image: "https://placehold.co/1200x500/01695b/ffffff/png?text=Gestión+Social+Universitaria",
    date_start: "",
    date_end: "",
    place: "",
    group: "",
  };

  if (items.length === 0) {
    items = [placeholder];
  }

  const length = items.length;

  // Prev / Next
  const prev = () => setIndex((i) => (i - 1 + length) % length);
  const next = () => setIndex((i) => (i + 1) % length);

  // Auto-slide cada 4 segundos
  useEffect(() => {
    if (paused) return;
    const interval = setInterval(next, 4000);
    return () => clearInterval(interval);
  }, [paused, index]);

  if (!items || items.length === 0) return null;

  return (
    <Box
      position="relative"
      w="100%"
      overflow="hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      h="500px"
    >
      {/* Contenedor de slides */}
      <Flex
        w={`${length * 100}%`}
        transform={`translateX(-${index * (100 / length)}%)`}
        transition="transform 0.6s ease-in-out"
      >
        {items.map((item) => (
          <Box key={item.id} w={`${100 / length}%`} position="relative">
            <Image
              src={item.image}
              alt={item.title}
              w="100%"
              h="500px"
              objectFit="cover"
              cursor={item.id !== -1 ? "pointer" : "default"}
              onClick={() => item.id !== -1 && router.push(`/actividad/${item.id}`)}
            />

            {/* Caja inferior */}
            <Box
              position="absolute"
              bottom="0"
              w="100%"
              bg="rgba(1, 105, 91, 0.95)"
              color="white"
              py={3}
              px={4}
              paddingBottom={10}
            >
              <Text
                fontSize="2xl"
                fontWeight="bold"
                cursor={item.id !== -1 ? "pointer" : "default"}
                onClick={() => item.id !== -1 && router.push(`/actividad/${item.id}`)}
              >
                {item.title}
              </Text>

              {/* Fecha + Lugar */}
              {item.id !== -1 && (
                <Text fontSize="xl" opacity={0.9} mt={3}>
                  {item.date_start === item.date_end
                    ? `📅 ${item.date_start} — 📍 ${item.place}`
                    : `📅 ${item.date_start} al ${item.date_end} — 📍 ${item.place}`}
                </Text>
              )}
              
              {/* Descripción. Limitada a 200 caracteres */}
              {item.description && (
                <Text fontSize="xl" mt={3}>
                  {item.description.length > 200
                    ? item.description.slice(0, 200) + "..."
                    : item.description}
                </Text>
              )}
            </Box>
          </Box>
        ))}
      </Flex>

      {/* Flechas */}
    {/*
      <IconButton
        aria-label="Prev"
        icon={<ChevronLeftIcon boxSize={10} />}
        position="absolute"
        top="50%"
        left="10px"
        transform="translateY(-50%)"
        onClick={prev}
        bg="rgba(1, 105, 91, 0.95)"
        _hover={{ bg: "white" }}
      />

      <IconButton
        aria-label="Next"
        icon={<ChevronRightIcon boxSize={10} />}
        position="absolute"
        top="50%"
        right="10px"
        transform="translateY(-50%)"
        onClick={next}
        bg="rgba(1, 105, 91, 0.95)"
        _hover={{ bg: "white" }}
      />
      */}

      {/* Dots */}
      <Flex
        position="absolute"
        bottom="10px"
        width="100%"
        justifyContent="center"
        gap={2}
      >
        {items.map((_, i) => (
          <Box
            key={i}
            w="10px"
            h="10px"
            borderRadius="full"
            bg={i === index ? "white" : "whiteAlpha.600"}
            cursor="pointer"
            onClick={() => setIndex(i)}
          />
        ))}
      </Flex>
    </Box>
  );
}
