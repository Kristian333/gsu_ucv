// src/components/ui/client-actividades.tsx
"use client";

import { Box, SimpleGrid, Card, CardBody, Stack, Image, Text } from "@chakra-ui/react";
import NextLink from 'next/link';
import React from 'react';
import { Heading, Paragraph } from "@/components/ui/tipografia";
import { Pagination } from "@/components/ui/pagination";

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

interface ClientActivitiesProps {
    activities: ActivityProps[];
    currentPage: number;
    totalPages: number;
}

const ActivityCard = ({ title, description, image, date_start, date_end, place, group }: ActivityProps) => {
    const placeholderImage = "https://placehold.co/400x400/cccccc/ffffff/png?text=Imagen+no+encontrada";

    // Formato de fecha
    const displayDate =
        date_start === date_end ? date_start : `${date_start} al ${date_end}`;

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
                    <Text fontSize="md" color="gray.600">📅 {displayDate}</Text>
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

export function ClientActivities({ activities, currentPage, totalPages }: ClientActivitiesProps) {
    return (
        <Box maxW="container.xl" mx="auto" py={10} px={6}>
            <SimpleGrid columns={1} spacing={4}>
                {activities.map(activity => (
                    <NextLink href={`/actividad/${activity.id}`} passHref key={activity.id}>
                        <ActivityCard
                            title={activity.title}
                            description={activity.description}
                            image={activity.image}
                            date_start={activity.date_start}
                            date_end={activity.date_end}
                            place={activity.place}
                            group={activity.group}
                            id={activity.id}
                        />
                    </NextLink>
                ))}
            </SimpleGrid>
            
            {/* Agrega el componente de paginación aquí */}
            <Pagination currentPage={currentPage} totalPages={totalPages} />
        </Box>
    );
}
