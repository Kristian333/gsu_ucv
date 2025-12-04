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
} from "@chakra-ui/react";
import React from "react";
import NextLink from 'next/link';
import { useRouter, usePathname } from "next/navigation"; 
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "@/app/context/auth-context";
import { useGlobalData } from "../../app/context/global-data-context";
import { ColorModeSwitcher } from "../ui/color-mode-switcher";
import { 
    PrimaryButton, 
    GhostButton,
    SecondaryButton, 
} from "../ui/buttons";

export const Navbar = () => {
    const { isAuthenticated, logout, isHydrated, user } = useAuth();

    const menuButtonColor = useColorModeValue("primary.500", "whiteAlpha.900");

    const userRole = user?.role || null;
    
    const showAdminPanel = userRole === "Admin";
    const showGroupPanel = userRole === "Invitado" || userRole === "Grupo";

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
                        <Heading size={{ base: "md", md: "lg" }} color={useColorModeValue("primary.500", "primary.300")}>
                            Gestión Social Universitaria
                        </Heading>
                    </Flex>
                </NextLink>

                <Spacer />

                {/* Navegación principal */}
                <HStack spacing={14} ml={5}>
                    <NextLink href="/grupos">
                        <Heading size={{ base: "sm", md: "md" }}>Grupos</Heading>
                    </NextLink>
                    <NextLink href="/actividades">
                        <Heading size={{ base: "sm", md: "md" }}>Actividades</Heading>
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
                                            width="32px"
                                            height="32px"
                                            objectFit="cover"
                                        />
                                    ) : (
                                        <FaUserCircle size="28px" />
                                    )
                                } 
                                variant="ghost"
                                color={menuButtonColor}
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
                                    <MenuItem onClick={handleLogout}>
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
