// Este es un Server Component por defecto
import React from 'react';
import { Box } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import { ClientContent } from '../components/ui/client-components';
import { mockGroupItems } from "@/data/gruposMock";
import { mockActivityItems } from "@/data/actividadesMock";
// Import dinámico del carrusel
const Carousel = dynamic(() => import("@/components/ui/carousel"), {
  ssr: false,
});

// Esta función simula una llamada a la API en el servidor
async function getGroups() {
    // Aquí es donde harías tu llamada a la API real, por ejemplo:
    // const res = await fetch('https://tu-api.com/groups');
    // const groups = await res.json();
    return mockGroupItems;
}

export default async function HomePage() {
    const groups = await getGroups();
    const activities = mockActivityItems;
    
    // Mezclar y tomar solo 3
    const shuffledGroups = groups.sort(() => Math.random() - 0.5).slice(0, 3);

    return (
        <Box minH="100vh">
            <Carousel activities={activities} />
            <ClientContent groups={shuffledGroups} />
        </Box>
    );
}
