// src/components/ui/client-grupos.tsx
"use client";

import { Box, SimpleGrid, Card, CardBody, Stack, Image, Text } from "@chakra-ui/react";
import NextLink from 'next/link';
import React, { useState, useEffect } from 'react';
import { Heading, Paragraph } from "@/components/ui/tipografia";
import { Pagination } from "@/components/ui/pagination";
import { useRouter } from 'next/navigation';
import { FACULTADES_FILTRO } from "@/constants/facultades";
import { formatListToString } from "@/utils/common";

interface GroupProps {
    id: string;
    title: string;
    faculty: string[];
    image: string | null;
}

interface ClientGroupsProps {
    groups: GroupProps[];
    currentPage: number;
    totalPages: number;
    currentSearch?: string;
    currentFaculty?: string;
    limit: number;
}

const GroupCard = ({ title, faculty, image }: Omit<GroupProps, 'id'>) => {
    const placeholderImage = "/imagen-no-disponible.jpg";
    const facultyDisplay = formatListToString(faculty);

    return (
        <Card overflow="hidden" variant="unstyled" display="flex" flexDirection="column" justifyContent="center" alignItems="center" role="group">
            <Box overflow="hidden" display="flex" justifyContent="center" alignItems="center" width="100%" height="268px" borderRadius="full" mx="auto">
                <Image
                    src={image as string}
                    alt={title}
                    objectFit="cover"
                    w="100%"
                    h="100%"
                    border="3px solid"
                    borderColor="primary"
                    borderRadius="full"
                    fallbackSrc={placeholderImage}
                />
            </Box>
            <CardBody>
                <Stack mt="6" spacing="3">
                    <Box
                        position="relative"
                        _after={{
                            content: `""`,
                            position: "absolute",
                            left: 0,
                            bottom: "-3px",
                            width: "0%",
                            height: "3px",
                            bg: "primary",
                            transition: "width 0.3s ease",
                        }}
                        _groupHover={{
                            _after: {
                                width: "100%",
                            },
                        }}
                    >
                        <Heading size="md">{title}</Heading>
                    </Box>
                    <Paragraph>{facultyDisplay}</Paragraph>
                </Stack>
            </CardBody>
        </Card>
    );
};

export function ClientGroups({ groups, currentPage, totalPages, currentSearch = "", currentFaculty = "" }: ClientGroupsProps) {
    
    const router = useRouter();
    const [search, setSearch] = useState(currentSearch);
    const [filterMenuOpen, setFilterMenuOpen] = useState(false);
    
    // Sincronizar el input local si cambia la URL
    useEffect(() => {
        setSearch(currentSearch);
    }, [currentSearch]);

    // Debounce para actualizar la URL tras escribir en el buscador
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== currentSearch) {
                updateUrl(search, currentFaculty);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [search]);

    const updateUrl = (newSearch: string, newFaculty: string) => {
        const query = new URLSearchParams();
        query.set("page", "1"); // Siempre resetear a página 1 al filtrar
        
        if (newSearch) {
            query.set("search", newSearch);
        }

        if (newFaculty) {
            query.set("faculty", newFaculty);
        }

        router.push(`/grupos?${query.toString()}`);
    };

    const handleFacultyChange = (faculty: string) => {
        setFilterMenuOpen(false);
        updateUrl(search, faculty);
    };

    const getDisplayFacultyName = (faculty: string) => {
        if (!faculty) return "";
        if (faculty === "DEU") return "Otros";
        return faculty.replace(/_/g, " ");
    };

    const displayFaculty = getDisplayFacultyName(currentFaculty);

    return (
        <Box maxW="container.xl" mx="auto" py={10} px={6}>
            
            {/* Buscador y Filtro */}
            <Box display="flex" gap={4} mb={8} flexWrap="wrap" justifyContent="center" width="100%">
                
                {/* Buscador */}
                <input
                    type="text"
                    placeholder="Buscar grupo..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        padding: "10px 15px",
                        borderRadius: "8px",
                        border: "1px solid #ccc",
                        minWidth: "260px",
                        flex: 1
                    }}
                />

                {/* Filtro por facultad */}
                <Box position="relative">
                    <button
                        style={{
                            padding: "10px 15px",
                            borderRadius: "8px",
                            border: "1px solid #ccc",
                            background: "white",
                            whiteSpace: "nowrap",
                            cursor: "pointer"
                        }}
                        onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                    >
                        {displayFaculty ? `Facultad: ${displayFaculty}` : "Filtrar por facultad"}
                    </button>

                    {filterMenuOpen && (
                        <Box
                            position="absolute"
                            top="45px"
                            right={0}
                            bg="white"
                            boxShadow="lg"
                            borderRadius="md"
                            zIndex={10}
                            p={2}
                            minW="220px"
                            maxH="300px"
                            overflowY="auto"
                        >
                            <Box
                                p={2}
                                cursor="pointer"
                                _hover={{ bg: "gray.100" }}
                                onClick={() => handleFacultyChange("")}
                            >
                                (Mostrar todos)
                            </Box>

                            {FACULTADES_FILTRO.map((f) => {
                                const label = f === "DEU" ? "Otros" : f;
                                return (
                                    <Box
                                        key={f}
                                        p={2}
                                        cursor="pointer"
                                        bg={currentFaculty === f ? "gray.100" : "transparent"}
                                        _hover={{ bg: "gray.100" }}
                                        onClick={() => handleFacultyChange(f)}
                                    >
                                        {label}
                                    </Box>
                                );
                            })}
                        </Box>
                    )}
                </Box>
            </Box>
            
            {/* Mensaje cuando no hay grupos */}
            {groups.length === 0 && (
                <Box textAlign="center" py={10}>
                <Text fontSize="xl">No se encontraron grupos registrados.</Text>
                </Box>
            )}

            {/* Grid con 4 columnas */}
            {groups.length > 0 && (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={10} textAlign="center">
                    {groups.map(group => (
                        <NextLink href={`/grupo/${group.id}`} passHref key={group.id}>
                            <GroupCard
                                title={group.title}
                                faculty={group.faculty}
                                image={group.image}
                            />
                        </NextLink>
                    ))}
                </SimpleGrid>
            )}
            
            {/* Paginación */}
            {groups.length > 0 && (
                <Box mt={8}>
                    <Pagination 
                        currentPage={currentPage} 
                        totalPages={totalPages} 
                        basePath="/grupos"
                        queryParams={{
                            ...(search ? { search } : {}),
                            ...(currentFaculty ? { faculty: currentFaculty } : {})
                        }}
                    />
                </Box>
             )}
        </Box>
    );
}
