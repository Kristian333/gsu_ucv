// /app/actividades/page.tsx
import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { ClientActivities } from '@/components/ui/client-actividades';
import { mockActivityItems } from "@/data/actividadesMock";

function sortActivities(data: any[]) {
    const today = new Date().toISOString().split("T")[0];

    const upcomingOrOngoing = [];
    const past = [];

    for (const act of data) {
        /*
            Clasificación:
            - Futuro: date_start > hoy
            - En curso: date_start <= hoy <= date_end
            - Pasado: date_end < hoy
        */
        if (act.date_start > today) {
            upcomingOrOngoing.push(act);
        } else if (act.date_start <= today && act.date_end >= today) {
            upcomingOrOngoing.push(act);
        } else {
            past.push(act);
        }
    }

    // Ordenar futuros/actuales ascendente por fecha de inicio
    upcomingOrOngoing.sort((a, b) => (a.date_start > b.date_start ? 1 : -1));

    // Ordenar pasados por fecha de finalización descendente
    past.sort((a, b) => (a.date_end < b.date_end ? 1 : -1));

    // Concatenar ambos grupos
    return [...upcomingOrOngoing, ...past];
}

// Esta función aplica la paginación después de ordenar
async function getActivities({ page, limit }: { page: number; limit: number }) {
    const sorted = sortActivities(mockActivityItems);

    const start = (page - 1) * limit;
    const end = start + limit;

    const activities = sorted.slice(start, end);
    const totalActivities = sorted.length;
    const totalPages = Math.ceil(totalActivities / limit);

    return { activities, totalPages };
}

interface ActividadesPageProps {
    searchParams: { page: string };
}

export default async function ActividadesPage({ searchParams }: ActividadesPageProps) {
    const page = Number(searchParams.page) || 1;
    const limit = 6; // Cantidad de actividades por página

    const { activities, totalPages } = await getActivities({ page, limit });

    return (
        <>
            {activities.length === 0 ? (
                <Box maxW="container.xl" mx="auto" py={10} px={6} textAlign="center">
                    <Text fontSize="xl">No se encontraron actividades.</Text>
                </Box>
            ) : (
                <ClientActivities activities={activities} currentPage={page} totalPages={totalPages} />
            )}
        </>
    );
}
