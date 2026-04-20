"use client";

import { useState, useEffect } from "react";
import { Box, Flex, IconButton, Image, Text, VStack, Container } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { useRouter } from "next/navigation";

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

export default function Carousel({activities}: CarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const router = useRouter();


  function normalizeDate(date: Date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function parseLocalDate(dateStr: string) {
    const [d, m, y] = dateStr.split("/").map(Number);
    return new Date(y, m - 1, d); 
  }

  const today = normalizeDate(new Date());

  // Filtrar, ordenar y limitar los items. Solo actividades futuras
  const upcomingOrOngoing = activities.filter(item => {
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
    area: [] as string[],
  };

  if (items.length === 0) items = [placeholder];

  const length = items.length;

  // Prev / Next
  const prev = () => setIndex((i) => (i - 1 + length) % length);
  const next = () => setIndex((i) => (i + 1) % length);

  const [tilt, setTilt] = useState({ x: 10, y: -18 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateY = ((x / rect.width) - 0.5) * 35;
    const rotateX = -((y / rect.height) - 0.5) * 35;

    setTilt({ x: rotateX, y: rotateY });
  };

  const resetTilt = () => setTilt({ x: 10, y: -18 });

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
      h={{ base: "auto", md: "600px" }}
      bg="transparent"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Contenedor de slides */}
      <Flex
        w={`${length * 100}%`}
        h="100%"
        transform={`translateX(-${index * (100 / length)}%)`}
        transition="transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
      >
        {items.map((item) => (
          <Box key={item.id} w={`${100 / length}%`} h="100%" px={{ base: 6, md: 32 }}>
            <Flex
              h="100%"
              align="center"
              justify="space-between"
              direction={{ base: "column", md: "row" }}
              onMouseMove={handleMouseMove}
              onMouseLeave={resetTilt}
            >
              {/* TEXTO */}
              <Box 
                maxW={{ base: "100%", md: "45%" }} 
                textAlign="left" 
                p={8}
                bg="white"
                backdropFilter="blur(10px)"
                borderRadius="2xl"
                boxShadow="xl"
                border="1px solid"
                borderColor="whiteAlpha.400"
              >
                <Text fontSize="3xl" fontWeight="black" mb={2} lineHeight="1.1" color="gray.800">
                  {item.title}
                </Text>

                {item.id !== -1 && (
                  <Text fontSize="sm" fontWeight="bold" color="primary" mb={4} textTransform="uppercase">
                    📅 {item.date_start === item.date_end ? item.date_start : `${item.date_start} al ${item.date_end}`} — 📍 {item.place}
                  </Text>
                )}

                <Text fontSize="lg" color="gray.700" mb={6} noOfLines={3}>
                  {item.description}
                </Text>
                
                {item.id !== -1 && (
                    <Box 
                        as="button" 
                        onClick={() => router.push(`/actividad/${item.id}`)}
                        bg="primary" 
                        color="white" 
                        px={8} 
                        py={3} 
                        borderRadius="full" 
                        fontWeight="bold"
                        _hover={{ transform: "translateY(-2px)", boxShadow: "0 10px 20px rgba(0,0,0,0.3)" }}
                        transition="all 0.2s"
                    >
                        Ver detalles
                    </Box>
                )}
              </Box>

              {/* IMAGEN */}
              <Box
                position="relative"
                w={{ base: "80%", md: "45%" }}
                perspective="1200px"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  borderRadius="3xl"
                  boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.4)"
                  transform={`rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) rotateZ(-3deg)`}
                  transition="transform 0.2s ease-out"
                  cursor="pointer"
                  onClick={() => item.id !== -1 && router.push(`/actividad/${item.id}`)}
                />
              </Box>
            </Flex>
          </Box>
        ))}
      </Flex>

      {/* Flechas */}
    
      <IconButton
        aria-label="Prev"
        icon={<ChevronLeftIcon boxSize={10} />}
        position="absolute"
        top="50%"
        left="20px"
        onClick={prev}
        variant="ghost"
        color="secondary"
        bg= "whiteAlpha.800"
        _hover={{ bg: "whiteAlpha.800", transform: "translateY(0%) scale(1.15)" }}
        zIndex={10}
      />

      <IconButton
        aria-label="Next"
        icon={<ChevronRightIcon boxSize={10} />}
        position="absolute"
        top="50%"
        right="20px"
        onClick={next}
        variant="ghost"
        color="secondary"
        bg= "whiteAlpha.800"
        _hover={{ bg: "whiteAlpha.800", transform: "translateY(0%) scale(1.15)" }}
        zIndex={10}
      />
      

      {/* Dots */}
      <Flex
        position="absolute"
        bottom="30px"
        width="100%"
        justifyContent="center"
        gap={3}
      >
        {items.map((_, i) => (
          <Box
            key={i}
            w={i === index ? "30px" : "10px"}
            h="6px"
            borderRadius="full"
            bg={i === index ? "secondary" : "whiteAlpha.700"}
            transition="all 0.3s ease"
            cursor="pointer"
            onClick={() => setIndex(i)}
          />
        ))}
      </Flex>
    </Box>
  );
}
