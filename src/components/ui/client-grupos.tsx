// src/components/ui/client-grupos.tsx
"use client";

import { Box, SimpleGrid, Card, CardBody, Stack, Image, Text } from "@chakra-ui/react";
import NextLink from 'next/link';
import React, { useMemo } from 'react';
import { Heading, Paragraph } from "@/components/ui/tipografia";
import { Pagination } from "@/components/ui/pagination";
import { useRouter } from 'next/navigation';

interface GroupProps {
    id: string;
    title: string;
    faculty: string;
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
    const placeholderImage = "https://placehold.co/400x200/cccccc/ffffff/png?text=Imagen+no+encontrada";
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
                    <Paragraph>{faculty}</Paragraph>
                </Stack>
            </CardBody>
        </Card>
    );
};

export function ClientGroups({ groups, currentPage, currentSearch = "", currentFaculty = "", limit }: ClientGroupsProps) {
    
    const router = useRouter();
    const [search, setSearch] = React.useState(currentSearch);
    const [facultyFilter, setFacultyFilter] = React.useState(currentFaculty);
    const [filterMenuOpen, setFilterMenuOpen] = React.useState(false);
    
    const faculties = ["Agronomía", "Arquitectura y Urbanismo", "Ciencias", "Ciencias Económicas y Sociales", "Farmacia", "Humanidades y Educación", "Ingeniería", "Ciencias Jurídicas y Políticas", "Medicina", "Odontología", "Ciencias Veterinarias", "DEU"];

    // Nota de Contingencia: El backend no filtra todavía por texto, así que hacemos una búsqueda reactiva local sobre el lote de la página actual
    const processedGroups = useMemo(() => {
        let resultado = groups.filter(g =>
            g.title.toLowerCase().includes(search.toLowerCase())
        );

        if (facultyFilter) {
            resultado = resultado.filter(g => g.faculty.toLowerCase().trim() === facultyFilter.toLowerCase().trim());
        }

        // Orden alfabético por cada página
        return [...resultado].sort((a, b) => a.title.localeCompare(b.title));
    }, [groups, search, facultyFilter]);

    // Recalcular total de páginas virtuales si hay filtros en el cliente
    const totalPagesVirtual = useMemo(() => {
        if (groups.length < limit) {
            return currentPage;
        }
        return currentPage + 1;
  }, [groups, currentPage, limit]);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        router.push(`/grupos?page=1&search=${encodeURIComponent(value)}&faculty=${encodeURIComponent(facultyFilter)}`);
    };

    const handleFacultyChange = (faculty: string) => {
        setFacultyFilter(faculty);
        setFilterMenuOpen(false);
        router.push(`/grupos?page=1&search=${encodeURIComponent(search)}&faculty=${encodeURIComponent(faculty)}`);
    };

    return (
        <Box maxW="container.xl" mx="auto" py={10} px={6}>
            
            {/*Buscador y Filtro */}
            <Box display="flex" gap={4} mb={8} flexWrap="wrap" justifyContent="center" width="100%">
                
                {/* Buscador */}
                <input
                    type="text"
                    placeholder="Buscar grupo..."
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
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
                            background: "primary",
                            whiteSpace: "nowrap"
                        }}
                        onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                    >
                        {facultyFilter ? `Facultad: ${facultyFilter}` : "Filtrar por facultad"}
                    </button>

                    {filterMenuOpen && (
                        <Box
                            position="absolute"
                            top="45px"
                            left={0}
                            bg="white"
                            boxShadow="lg"
                            borderRadius="md"
                            zIndex={10}
                            p={2}
                            minW="160px"
                        >
                            <Box
                                p={2}
                                cursor="pointer"
                                _hover={{ bg: "gray.100" }}
                                onClick={() => handleFacultyChange("")}
                            >
                                (Mostrar todos)
                            </Box>

                            {faculties.map((f) => (
                                <Box
                                    key={f}
                                    p={2}
                                    cursor="pointer"
                                    _hover={{ bg: "gray.100" }}
                                    onClick={() => handleFacultyChange(f)}
                                >
                                    {f}
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>
            </Box>
            
            {/* Mensaje cuando no hay grupos */}
            {processedGroups.length === 0 && (
                <Box textAlign="center" py={10}>
                <Text fontSize="xl">No se encontraron grupos registrados.</Text>
                </Box>
            )}

            {/* Grid con 4 columnas */}
            {processedGroups.length > 0 && (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={10} textAlign="center">
                    {processedGroups.map(group => (
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
            {processedGroups.length > 0 && (
            <Pagination currentPage={currentPage} totalPages={totalPagesVirtual} />
             )}
        </Box>
    );
}
