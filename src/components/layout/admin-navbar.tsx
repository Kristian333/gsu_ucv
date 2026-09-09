// src/components/layout/admin-navbar.tsx
"use client";

import { Box, Flex, Link as ChakraLink, useColorModeValue } from '@chakra-ui/react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';

export function AdminNavbar() {
  const pathname = usePathname();
  const linkColor = useColorModeValue('gray.600', 'gray.300');
  const activeLinkColor = 'secondary.500';
  const activeLinkBg = useColorModeValue('gray.100', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  const mainLinks = [
    { name: 'Dashboard', href: '/admin/dashboard' },
    { name: 'Solicitudes', href: '/admin/solicitudes' },
    { name: 'Grupos', href: '/admin/grupos' },
    { name: 'Reportes de Actividad', href: '/admin/reportes' },
    //{ name: 'Usuarios', href: '/admin/usuarios' },
    { name: 'Estadísticas', href: '/admin/estadisticas' },
    { name: 'Formatos de Solicitudes', href: '/admin/formatos' },
  ];

  const rightLink = { name: 'Info DEU', href: '/admin/info_general' };

  return (
    <Box 
      bg={useColorModeValue('white', 'gray.800')} 
      borderBottom="1px" 
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      py={4}
      px={8}
      shadow="sm"
    >
      <Flex as="nav" align="center" justify="space-between" wrap="wrap" gap={4}>
        {/* Enlaces Principales a la Izquierda */}
        <Flex gap={4} wrap="wrap">
          {mainLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <NextLink key={link.name} href={link.href} passHref legacyBehavior>
                <ChakraLink
                  px={4}
                  py={2}
                  rounded="md"
                  fontWeight="medium"
                  _hover={{ textDecoration: 'none', bg: hoverBg }}
                  color={isActive ? activeLinkColor : linkColor}
                  bg={isActive ? activeLinkBg : 'transparent'}
                >
                  {link.name}
                </ChakraLink>
              </NextLink>
            );
          })}
        </Flex>

        {/* Opción separada a la Derecha */}
        <Box>
          <NextLink href={rightLink.href} passHref legacyBehavior>
            <ChakraLink
              px={4}
              py={2}
              rounded="md"
              fontWeight="medium"
              _hover={{ textDecoration: 'none', bg: hoverBg }}
              color={pathname.startsWith(rightLink.href) ? activeLinkColor : linkColor}
              bg={pathname.startsWith(rightLink.href) ? activeLinkBg : 'transparent'}
            >
              {rightLink.name}
            </ChakraLink>
          </NextLink>
        </Box>
      </Flex>
    </Box>
  );
}