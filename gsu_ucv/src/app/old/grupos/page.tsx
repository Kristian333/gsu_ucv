// /app/grupos/page.tsx
import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { ClientGroups } from '@/components/ui/client-grupos';
import { mockGroupItems } from "@/data/gruposMock";

// Esta función ahora acepta los parámetros de paginación
async function getGroups({ page, limit }: { page: number; limit: number }) {
    const start = (page - 1) * limit;
    const end = start + limit;
    const groups = mockGroupItems.slice(start, end);
    const totalGroups = mockGroupItems.length;
    const totalPages = Math.ceil(totalGroups / limit);

    return { groups, totalPages };
}

interface GruposPageProps {
    searchParams: { page: string };
}

export default async function GruposPage({ searchParams }: GruposPageProps) {
    const page = Number(searchParams.page) || 1;
    const limit = 12; // Cuantos grupos por página

    const { groups, totalPages } = await getGroups({ page, limit });

    if (groups.length === 0) {
        return (
            <Box maxW="container.xl" mx="auto" py={10} px={6} textAlign="center">
                <Text fontSize="xl">No se encontraron grupos.</Text>
            </Box>
        );
    }

    return (
        <ClientGroups groups={groups} currentPage={page} totalPages={totalPages} />
    );
}