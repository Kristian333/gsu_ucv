"use client";

import { useState, useEffect, useMemo } from "react";
import { Box, Flex, IconButton, Image, Text, Heading } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

// --- Envolturas Motion para Chakra ---
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);

// --- Tipos ---
interface Activity {
  id: number;
  title: string;
  description: string;
  image: string;
  date_start: string;
  date_end: string;
  place: string;
}

interface CarouselProps {
  activities: Activity[];
}

// --- Subcomponente Slide ---
const Slide = ({ item, router, isActive }: { item: Activity; router: any; isActive: boolean }) => {
  // Valores de movimiento para el Tilt (no causan re-renders de React)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Suavizado físico
  const mouseX = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 20 });

  // Mapeo de posición a rotación
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-15, 15]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const resetTilt = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <Flex minW="100%" h="500px" align="center" justify="space-around" px={{ base: 10, md: 20 }}>
      {/* BLOQUE DE TEXTO */}
      <MotionBox 
        maxW="40%" 
        p={10} 
        borderRadius="3xl" 
        zIndex={2}
        initial={{ opacity: 0, x: -50 }}
        animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <MotionHeading as="h2" size="xl" mb={4} color="green.800">
          {item.title}
        </MotionHeading>

        {item.id !== -1 && (
          <MotionText fontSize="md" fontWeight="bold" color="green.600" mb={4}>
            📅 {item.date_start === item.date_end ? item.date_start : `${item.date_start} al ${item.date_end}`} 
            <br /> 📍 {item.place}
          </MotionText>
        )}

        <Text fontSize="lg" color="gray.600" noOfLines={4} lineHeight="1.6">
          {item.description}
        </Text>
      </MotionBox>

      {/* IMAGEN CON PERSPECTIVA 3D */}
      <Box 
        w="45%" 
        style={{ perspective: 1200 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={resetTilt}
        zIndex={2}
      >
        <MotionBox
          style={{ rotateX, rotateY, rotateZ: -6 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          whileHover={{ scale: 1.02 }}
        >
          {/* Sombra dinámica */}
          <Box
            position="absolute"
            inset="5"
            bg="blackAlpha.300"
            filter="blur(40px)"
            transform="translateY(20px)"
            zIndex={-1}
          />
          <Image
            src={item.image}
            alt={item.title}
            borderRadius="3xl"
            boxShadow="2xl"
            cursor={item.id !== -1 ? "pointer" : "default"}
            onClick={() => item.id !== -1 && router.push(`/actividad/${item.id}`)}
            objectFit="cover"
            maxH="400px"
            w="100%"
          />
        </MotionBox>
      </Box>
    </Flex>
  );
};

// --- Componente Principal ---
export default function Carousel({ activities }: CarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const router = useRouter();

  const items = useMemo(() => {
    if (!activities || activities.length === 0) {
      return [{
        id: -1,
        title: "Bienvenido a Gestión Social",
        description: "Descubre nuestros grupos de extensión y sus actividades.",
        image: "https://unsplash.com",
        date_start: "", date_end: "", place: "",
      }];
    }
    const today = new Date().toISOString().split('T')[0];
    return [...activities]
      .filter((a) => a.date_end >= today)
      .sort((a, b) => a.date_start.localeCompare(b.date_start))
      .slice(0, 5);
  }, [activities]);

  const next = () => setIndex((i) => (i + 1) % items.length);
  const prev = () => setIndex((i) => (i - 1 + items.length) % items.length);

  useEffect(() => {
    if (paused || items.length <= 1) return;
    const interval = setInterval(next, 6000);
    return () => clearInterval(interval);
  }, [paused, items.length, index]);

  return (
    <Box
      position="relative"
      w="100%"
      maxW="1400px"
      mx="auto"
      h="500px"
      overflow="hidden"
      bgGradient="linear(to-br, gray.50, green.100)"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* FONDO: NUBE 1 */}
      <MotionBox
        position="absolute"
        top="-10%"
        left="-5%"
        w="60%"
        h="80%"
        bg="radial-gradient(circle, white 0%, rgba(255,255,255,0) 70%)"
        filter="blur(60px)"
        opacity={0.7}
        zIndex={0}
        animate={{ x: [-20, 20], y: [0, 30] }}
        transition={{ duration: 8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      />

      {/* FONDO: NUBE 2 */}
      <MotionBox
        position="absolute"
        bottom="-15%"
        right="-5%"
        w="50%"
        h="70%"
        bg="radial-gradient(circle, white 0%, rgba(255,255,255,0) 70%)"
        filter="blur(80px)"
        opacity={0.6}
        zIndex={0}
        animate={{ x: [20, -20], y: [0, -40] }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      />

      {/* TRACK DE SLIDES (Con soporte Drag/Swipe) */}
      <MotionFlex
        position="relative"
        zIndex={1}
        display="flex"
        cursor="grab"
        _active={{ cursor: "grabbing" }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(_, info) => {
          if (info.offset.x < -100) next();
          else if (info.offset.x > 100) prev();
        }}
        animate={{ x: `-${index * 100}%` }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
      >
        {items.map((item, i) => (
          <Slide key={i} item={item} router={router} isActive={index === i} />
        ))}
      </MotionFlex>

      {/* CONTROLES */}
      {items.length > 1 && (
        <>
          <IconButton
            aria-label="Anterior"
            icon={<ChevronLeftIcon boxSize={8} />}
            position="absolute"
            left="4"
            top="50%"
            transform="translateY(-50%)"
            onClick={prev}
            variant="ghost"
            colorScheme="green"
            rounded="full"
            zIndex={10}
            _hover={{ bg: "whiteAlpha.800" }}
          />
          <IconButton
            aria-label="Siguiente"
            icon={<ChevronRightIcon boxSize={8} />}
            position="absolute"
            right="4"
            top="50%"
            transform="translateY(-50%)"
            onClick={next}
            variant="ghost"
            colorScheme="green"
            rounded="full"
            zIndex={10}
            _hover={{ bg: "whiteAlpha.800" }}
          />
        </>
      )}

      {/* INDICADORES (DOTS) */}
      <Flex position="absolute" bottom="8" w="100%" justify="center" gap={2} zIndex={10}>
        {items.map((_, i) => (
          <Box
            key={i}
            w={i === index ? "40px" : "12px"}
            h="6px"
            borderRadius="full"
            bg={i === index ? "green.500" : "green.200"}
            transition="all 0.4s ease"
            cursor="pointer"
            onClick={() => setIndex(i)}
          />
        ))}
      </Flex>
    </Box>
  );
}