// src/components/layout/admin-navbar.tsx
"use client";

import { Box, Flex, Button, Link as ChakraLink, useColorModeValue } from '@chakra-ui/react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';

export function AdminNavbar() {
  const pathname = usePathname();
  const linkColor = useColorModeValue('gray.600', 'gray.300');
  const activeLinkColor = 'blue.500';
  const activeLinkBg = useColorModeValue('gray.100', 'gray.700');

  const links = [
    { name: 'Dashboard', href: '/admin/dashboard' },
    { name: 'Solicitudes', href: '/admin/solicitudes' },
    { name: 'Usuarios', href: '/admin/usuarios' },
  ];

  return (
    <Box 
      bg={useColorModeValue('white', 'gray.800')} 
      borderBottom="1px" 
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      py={4}
      px={8}
      shadow="sm"
    >
      <Flex as="nav" align="center" justify="space-between" wrap="wrap">
        <Flex gap={4}>
          {links.map((link) => (
            <NextLink key={link.name} href={link.href} passHref legacyBehavior>
              <ChakraLink
                px={4}
                py={2}
                rounded="md"
                fontWeight="medium"
                _hover={{ textDecoration: 'none', bg: useColorModeValue('gray.50', 'gray.700') }}
                color={pathname.startsWith(link.href) ? activeLinkColor : linkColor}
                bg={pathname.startsWith(link.href) ? activeLinkBg : 'transparent'}
              >
                {link.name}
              </ChakraLink>
            </NextLink>
          ))}
        </Flex>
      </Flex>
    </Box>
  );
}