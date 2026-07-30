// components/layout/Navbar.tsx
"use client";

import {
    Box,
    Flex,
    Heading,
    Spacer,
    useColorModeValue,
    HStack,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    IconButton,
    Image as ChakraImage,
  Text,
} from "@chakra-ui/react";
import React from "react";
import NextLink from 'next/link';
import { useRouter, usePathname } from "next/navigation"; 
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "@/app/context/auth-context";
import { SecondaryButton } from "../ui/buttons";
import { ColorModeSwitcher } from "../ui/color-mode-switcher";

export const Navbar = () => {
    const { isAuthenticated, logout, isHydrated, user } = useAuth();

    const menuButtonColor = useColorModeValue("primary.500", "whiteAlpha.900");

    const userRole = (user?.roles || []).map(r => r.toLowerCase().trim());
    
    const showAdminPanel = userRole.includes('root') || userRole.includes('deu_admin');
    const showGroupPanel = userRole.includes('visitante') || userRole.includes('group_admin') || userRole.includes('group_helper');
    const showFacultyPanel = userRole.includes('faculty_admin');

    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = () => {
        logout();

        // Si estoy dentro del panel admin o group, redirigir al home
        if (pathname.startsWith("/admin") || pathname.startsWith("/admingroup")) {
            router.push("/");
        }
    };

    return (
        <Box bg={"navbar"} px={{ base: 4, md: 8 }} py={3} shadow="md">
            <Flex alignItems="center" maxW="container.xl" mx="auto">
                {/* Logo + Título */}
                <NextLink href="/" passHref>
                    <Flex alignItems="center" gap={{ base: 2, md: 4 }} cursor="pointer">
                        <ChakraImage
                            src="/logo.png"
                            alt="Logo"
                            width={{ base: "40px", md: "50px" }}
                            height="auto"
                        />
                        <Heading size={{ base: "md", md: "lg" }} color="white">
                            Gestión Social Universitaria
                        </Heading>
                    </Flex>
                </NextLink>

                <Spacer />

                {/* Navegación principal */}
                <HStack spacing={14} ml={5}>
                    <NextLink href="/grupos" passHref>
                        <Heading size={{ base: "sm", md: "md" }} color="white">Grupos</Heading>
                    </NextLink>
                    <NextLink href="/actividades" passHref>
                        <Heading size={{ base: "sm", md: "md" }} color="white">Actividades</Heading>
                    </NextLink>
                </HStack>

                <Spacer />

                {/* Autenticación */}
                <HStack spacing={{ base: 2, md: 4 }}>
                    {isHydrated && isAuthenticated ? (
                        <Menu>
                            <MenuButton 
                                as={IconButton} 
                                aria-label="Opciones de usuario"
                                icon={
                                    user?.avatar && user.avatar !== "" ? (
                                        <ChakraImage
                                            src={user.avatar}
                                            alt="Avatar"
                                            borderRadius="full"
                                            width="50px"
                                            height="50px"
                                            objectFit="cover"
                                            border="3px solid"
                                            borderColor="secondary"
                                        />
                                    ) : (
                                        <FaUserCircle size="28px" />
                                    )
                                } 
                                variant="ghost"
                                borderRadius="full"
                                color="white"
                                _hover={{ bg: "whiteAlpha.200" }}
                                _active={{ bg: "whiteAlpha.300" }}
                            />
                                <MenuList>
                                    {showAdminPanel && (
                                        <MenuItem as={NextLink} href="/admin">
                                            Panel de Administración
                                        </MenuItem>
                                    )}
                                    {showGroupPanel && (
                                        <MenuItem as={NextLink} href="/admingroup">
                                            Panel de Grupos
                                        </MenuItem>
                                    )}
                                    {showFacultyPanel && (
                                        <MenuItem as={NextLink} href="/adminfacultad">
                                            Panel de Facultad
                                        </MenuItem>
                                    )}
                                    <MenuItem onClick={handleLogout} fontWeight="bold" color="danger">
                                        Cerrar Sesión
                                    </MenuItem>
                                </MenuList>
                            </Menu>
                    ) : (
                        isHydrated && (
                            <NextLink href="/login" passHref>
                                <SecondaryButton size="md">Iniciar Sesión</SecondaryButton>
                            </NextLink>
                        )
                    )}
                    {/*<ColorModeSwitcher />*/}
                </HStack>
            </Flex>
        </Box>
    );
};
