// src/components/ui/client-actividades.tsx
"use client";

import { Box, SimpleGrid, Card, CardBody, Stack, Image, Text } from "@chakra-ui/react";
import NextLink from 'next/link';
import React from 'react';
import { Heading, Paragraph } from "@/components/ui/tipografia";
import { Pagination } from "@/components/ui/pagination";
import { useRouter } from 'next/navigation';
import { formatActivityDateRange } from "@/utils/common";

interface ActivityProps {
    id: string;
    title: string;
    description: string;
    image: string | null;
    date_start: string;
    date_end: string;
    place: string;
    group: string;
}

interface GroupOption {
    id: string;
    nombre: string;
}

interface ClientActivitiesProps {
    activities: ActivityProps[];
    allGroups: GroupOption[];
    currentPage: number;
    totalPages: number;
    currentSearch: string;
    currentGroup: string;
    currentStatus: string;
}

const ActivityCard = ({ title, description, image, date_start, date_end, place, group }: ActivityProps) => {
    const placeholderImage = "/imagen-no-disponible.jpg";

    // Formato de fecha
    const displayDate = formatActivityDateRange(date_start, date_end);

    return (
        <Card
            overflow="hidden"
            variant="outline"
            borderRadius="md"
            display="flex"
            flexDirection={{ base: "column", md: "row" }}
            gap={4}
            mb={6}
            transition="all 0.25s ease"
            _hover={{
                transform: "translateY(-6px)",
                shadow: "xl",
                cursor: "pointer",
            }}
        >
            {/* Imagen */}
            <Box flex="1" minW={{ base: "100%", md: "250px" }} maxW={{ md: "250px" }} h={{ base: "200px", md: "250px" }} borderRadius="md" overflow="hidden">
                <Image
                    src={image || placeholderImage}
                    alt={title}
                    objectFit="cover"
                    w="100%"
                    h="100%"
                    borderRadius="md"
                    fallbackSrc={placeholderImage}
                />
            </Box>

            {/* Información */}
            <CardBody flex="2" display="flex" flexDirection="column" justifyContent="flex-start">
                <Stack spacing={3}>
                    <Heading size="lg">{title}</Heading>
                    {displayDate && <Text fontSize="md" color="gray.600">📅 {displayDate}</Text>}
                    <Text fontSize="md" color="gray.600">📍 {place}</Text>
                    {group && <Text fontSize="md" color="gray.600">👥 {group}</Text>}
                    <Paragraph>
                        {description.length > 200 ? description.slice(0, 200) + "..." : description}
                    </Paragraph>
                </Stack>
            </CardBody>
        </Card>
    );
};

export function ClientActivities({
    activities,
    allGroups,
    currentPage,
    totalPages,
    currentSearch,
    currentGroup,
    currentStatus,
}: ClientActivitiesProps) {
    const router = useRouter();

    const [search, setSearch] = React.useState(currentSearch);
    const [group, setGroup] = React.useState(currentGroup);
    const [status, setStatus] = React.useState(currentStatus);

    function updateURL(newSearch: string, newGroup: string, newStatus: string) {
        const params = new URLSearchParams();
        params.set("page", "1"); // Al cambiar un filtro siempre volvemos a la página 1
        if (newSearch) params.set("search", newSearch);
        if (newGroup) params.set("group", newGroup);
        if (newStatus) params.set("status", newStatus);

        router.push(`/actividades?${params.toString()}`);
    }

    return (
        <Box maxW="container.xl" mx="auto" py={10} px={6}>
            
            {/* Buscador y Filtros */}
            <Box display="flex" flexWrap="wrap" gap={4} mb={8} width="100%">

                {/* Buscador */}
                <input
                    type="text"
                    placeholder="Buscar actividad..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        updateURL(e.target.value, group, status);
                    }}
                    style={{
                        padding: "10px 15px",
                        borderRadius: "8px",
                        border: "1px solid #ccc",
                        minWidth: "260px",
                        flex: 1,
                    }}
                />

                {/* Filtro por grupo */}
                <select
                    value={group}
                    onChange={(e) => {
                        setGroup(e.target.value);
                        updateURL(search, e.target.value, status);
                    }}
                    style={{
                        padding: "10px 15px",
                        borderRadius: "8px",
                        border: "1px solid #ccc",
                        minWidth: "200px",
                        maxWidth: "250px",
                        whiteSpace: "nowrap",
                    }}
                >
                    <option value="">Todos los grupos</option>
                    {allGroups.map(g => (
                        <option key={g.id} value={g.id}>{g.nombre}</option>
                    ))}
                </select>

                {/* Filtro por estado */}
                <select
                    value={status}
                    onChange={(e) => {
                        setStatus(e.target.value);
                        updateURL(search, group, e.target.value);
                    }}
                    style={{
                        padding: "10px 15px",
                        borderRadius: "8px",
                        border: "1px solid #ccc",
                        minWidth: "200px",
                        whiteSpace: "nowrap",
                    }}
                >
                    <option value="">Todos los estados</option>
                    <option value="futura">Futuras</option>
                    <option value="en_curso">En curso</option>
                    <option value="finalizada">Finalizadas</option>
                </select>
            </Box>

            {activities.length === 0 && (
                <Box textAlign="center" py={10}>
                <Text fontSize="xl">No se encontraron actividades.</Text>
                </Box>
            )}

            <SimpleGrid columns={1} spacing={4}>
                {activities.map(activity => (
                    <NextLink href={`/actividad/${activity.id}`} passHref key={activity.id}>
                        <ActivityCard {...activity} />
                    </NextLink>
                ))}
            </SimpleGrid>
            
            {/* Paginación */}
            <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                basePath="/actividades"
                queryParams={{
                    ...(currentSearch ? { search: currentSearch } : {}),
                    ...(currentGroup ? { group: currentGroup } : {}),
                    ...(currentStatus ? { status: currentStatus } : {}),
                }}
            />
        </Box>
    );
}
