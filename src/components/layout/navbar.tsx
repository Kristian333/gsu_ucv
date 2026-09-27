// components/layout/Navbar.tsx
"use client";

import {
    Box,
    Flex,
    Heading,
    Spacer,
    useColorModeValue,
    HStack,
    VStack,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    IconButton,
    Image as ChakraImage,
    Text,
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    useDisclosure,
    Divider,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import React from "react";
import NextLink from 'next/link';
import { useRouter, usePathname } from "next/navigation"; 
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "@/app/context/auth-context";
import { SecondaryButton } from "../ui/buttons";
import { ColorModeSwitcher } from "../ui/color-mode-switcher";

export const Navbar = () => {
    const { isAuthenticated, logout, isHydrated, user } = useAuth();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const menuButtonColor = useColorModeValue("primary.500", "whiteAlpha.900");

    const userRole = (user?.roles || []).map(r => r.toLowerCase().trim());

    const showAdminPanel = userRole.includes('root') || userRole.includes('deu_admin');
    const showGroupPanel = userRole.includes('visitante') || userRole.includes('group_admin') || userRole.includes('group_helper');
    const showFacultyPanel = userRole.includes('faculty_admin');

    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = () => {
        logout();
        onClose();
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
                        <Heading size={{ base: "md", md: "lg" }} color="white" noOfLines={1}>
                            Gestión Social Universitaria
                        </Heading>
                    </Flex>
                </NextLink>

                <Spacer />

                {/* Navegación principal */}
                <HStack spacing={14} ml={5} display={{ base: "none", md: "flex" }}>
                    <NextLink href="/grupos" passHref>
                        <Heading size="md" color="white">Grupos</Heading>
                    </NextLink>
                    <NextLink href="/actividades" passHref>
                        <Heading size="md" color="white">Actividades</Heading>
                    </NextLink>
                </HStack>

                <Spacer display={{ base: "none", md: "block" }} />

                {/* Autenticación */}
                <HStack spacing={4} display={{ base: "none", md: "flex" }}>
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
                                            fallbackSrc="/imagen-no-disponible.jpg"
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

                {/* Botón hamburguesa — solo móvil */}
                <IconButton
                    aria-label="Abrir menú"
                    icon={<HamburgerIcon />}
                    display={{ base: "flex", md: "none" }}
                    onClick={onOpen}
                    variant="ghost"
                    color="white"
                    _hover={{ bg: "whiteAlpha.200" }}
                    ml={2}
                />
            </Flex>

            {/* Menú lateral móvil */}
            <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader borderBottomWidth="1px">Menú</DrawerHeader>
                    <DrawerBody>
                        <VStack align="stretch" spacing={4} mt={4}>
                            <NextLink href="/grupos" passHref>
                                <Text fontSize="lg" fontWeight="semibold" onClick={onClose}>
                                    Grupos
                                </Text>
                            </NextLink>
                            <NextLink href="/actividades" passHref>
                                <Text fontSize="lg" fontWeight="semibold" onClick={onClose}>
                                    Actividades
                                </Text>
                            </NextLink>

                            <Divider />

                            {isHydrated && isAuthenticated ? (
                                <>
                                    {showAdminPanel && (
                                        <NextLink href="/admin" passHref>
                                            <Text fontSize="md" onClick={onClose}>
                                                Panel de Administración
                                            </Text>
                                        </NextLink>
                                    )}
                                    {showGroupPanel && (
                                        <NextLink href="/admingroup" passHref>
                                            <Text fontSize="md" onClick={onClose}>
                                                Panel de Grupos
                                            </Text>
                                        </NextLink>
                                    )}
                                    {showFacultyPanel && (
                                        <NextLink href="/adminfacultad" passHref>
                                            <Text fontSize="md" onClick={onClose}>
                                                Panel de Facultad
                                            </Text>
                                        </NextLink>
                                    )}
                                    <Text
                                        fontSize="md"
                                        fontWeight="bold"
                                        color="danger"
                                        cursor="pointer"
                                        onClick={handleLogout}
                                    >
                                        Cerrar Sesión
                                    </Text>
                                </>
                            ) : (
                                isHydrated && (
                                    <NextLink href="/login" passHref>
                                        <SecondaryButton size="md" width="full" onClick={onClose}>
                                            Iniciar Sesión
                                        </SecondaryButton>
                                    </NextLink>
                                )
                            )}
                        </VStack>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </Box>
    );
};
