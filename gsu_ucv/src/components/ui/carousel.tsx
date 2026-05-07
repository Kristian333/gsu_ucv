"use client";

import { useState, useEffect } from "react";
import { Box, Flex, IconButton, Image, Text } from "@chakra-ui/react";
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
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d); // <-- esto es local siempre
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

  if (items.length === 0) {
    items = [placeholder];
  }

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

  const resetTilt = () => {
    setTilt({ x: 10, y: -18 });
  };

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
      h="500px"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Contenedor de slides */}
      <Flex
        w={`${length * 100}%`}
        transform={`translateX(-${index * (100 / length)}%)`}
        transition="transform 0.6s ease-in-out"
      >
        {items.map((item) => (
          <Box key={item.id} w={`${100 / length}%`} px={12}>
            <Flex
              h="500px"
              align="center"
              justify="space-between"
              onMouseMove={handleMouseMove}
              onMouseLeave={resetTilt}
            >
              {/* TEXTO */}
              <Box maxW="45%" marginLeft="25px" color="black">
                <Text fontSize="3xl" fontWeight="bold" mb={4}>
                  {item.title}
                </Text>

                {item.id !== -1 && (
                  <Text fontSize="lg" opacity={0.85} mb={4}>
                    {item.date_start === item.date_end
                      ? `📅 ${item.date_start} — 📍 ${item.place}`
                      : `📅 ${item.date_start} al ${item.date_end} — 📍 ${item.place}`}
                  </Text>
                )}

                {item.description && (
                  <Text fontSize="lg" lineHeight="1.6">
                    {item.description.length > 200
                      ? item.description.slice(0, 200) + "..."
                      : item.description}
                  </Text>
                )}
              </Box>

              {/* IMAGEN */}
              <Box
                position="relative"
                w="45%"
                perspective="1000px"
              >
                <Box
                  position="absolute"
                  inset="0"
                  bg="black"
                  filter="blur(40px)"
                  opacity={0.25}
                  transform="translateY(40px)"
                  zIndex={0}
                />
                <Image
                  zIndex={1}
                  position="relative"
                  src={item.image}
                  alt={item.title}
                  borderRadius="2xl"
                  boxShadow="2xl"
                  transform={`
                    rotateX(${tilt.x}deg)
                    rotateY(${tilt.y}deg)
                    rotateZ(-6deg)
                  `}
                  transition="transform 0.15s ease-out"
                  cursor={item.id !== -1 ? "pointer" : "default"}
                  onClick={() =>
                    item.id !== -1 && router.push(`/actividad/${item.id}`)
                  }
                />
              </Box>
            </Flex>
          </Box>
        ))}
      </Flex>

      {/* Flechas */}
    
      <IconButton
        aria-label="Prev"
        icon={<ChevronLeftIcon boxSize={8} />}
        position="absolute"
        top="50%"
        left="24px"
        transform="translateY(-50%)"
        onClick={prev}
        bg="whiteAlpha.800"
        color="black"
        borderRadius="full"
        boxShadow="lg"
        _hover={{ bg: "white" }}
      />

      <IconButton
        aria-label="Next"
        icon={<ChevronRightIcon boxSize={8} />}
        position="absolute"
        top="50%"
        right="24px"
        transform="translateY(-50%)"
        onClick={next}
        bg="whiteAlpha.800"
        color="black"
        borderRadius="full"
        boxShadow="lg"
        _hover={{ bg: "white" }}
      />
      

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
            bg={i === index ? "secondary" : "blackAlpha.600"}
            cursor="pointer"
            onClick={() => setIndex(i)}
          />
        ))}
      </Flex>
    </Box>
  );
}
