// app/admin/grupos/[id]/layout.tsx

"use client";

import { Box, Flex, VStack, Icon, Text, Container } from "@chakra-ui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiInfo, FiUser, FiActivity, FiBarChart2, FiExternalLink } from "react-icons/fi";

export default function GrupoAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const pathname = usePathname();
  const baseUrl = `/admin/grupo/${params.id}`;

  const navItems = [
    { label: "Información", href: baseUrl, icon: FiInfo },
    { label: "Cuenta de Usuario", href: `${baseUrl}/usuario`, icon: FiUser },
    { label: "Actividades", href: `${baseUrl}/actividades`, icon: FiActivity },
    { label: "Estadísticas", href: `${baseUrl}/estadisticas`, icon: FiBarChart2 },
    { label: "Página Pública", href: `/grupo/${params.id}`, icon: FiExternalLink },
  ];

  return (
    <Container maxW="full" px={{ base: 4, md: 8 }} py={6}>
      <Flex gap={6} direction={{ base: "column", md: "row" }}>
        {/* Sidebar Compacto */}
        <Box
          w={{ base: "full", md: "240px" }}
          flexShrink={0}
          bg="white"
          p={4}
          borderRadius="xl"
          borderWidth="1px"
          borderColor="gray.200"
          h="fit-content"
          shadow="sm"
        >
          <VStack align="stretch" spacing={2}>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} passHref>
                  <Flex
                    align="center"
                    p={3}
                    borderRadius="lg"
                    cursor="pointer"
                    bg={isActive ? "primary.500" : "transparent"}
                    color={isActive ? "white" : "gray.600"}
                    _hover={{
                      bg: isActive ? "primary.600" : "gray.100",
                      color: isActive ? "white" : "primary.600",
                    }}
                    transition="all 0.2s"
                    fontWeight={isActive ? "semibold" : "normal"}
                  >
                    <Icon as={item.icon} mr={3} boxSize={5} />
                    <Text fontSize="sm">{item.label}</Text>
                  </Flex>
                </Link>
              );
            })}
          </VStack>
        </Box>

        {/* Contenido Principal */}
        <Box flex="1" bg="white" p={8} borderRadius="xl" borderWidth="1px" borderColor="gray.200" shadow="sm">
          {children}
        </Box>
      </Flex>
    </Container>
  );
}