// /app/page.tsx
import React from 'react';
import { Box } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import { Heading, Paragraph } from "@/components/ui/tipografia";
import { ClientContent } from '../components/ui/client-components';
import { mockActivityItems } from "@/data/actividadesMock";
import { apiServerRequest } from "@/utils/apiServer"; 

interface GroupBackend {
    id: any;
    nombre?: string;
    name?: string;
    image?: string;
    logo_url?: string;
    logo?: string;
}

async function getGroups(): Promise<GroupBackend[]> {
    try {
        const responseData = await apiServerRequest('groups?per_page=100', {
            next: { revalidate: 60 } 
        });

        return responseData?.grupos || responseData?.Groups || [];
    } catch (error) {
        console.error("HOME SERVER - Error trayendo grupos con apiServerRequest:", error);
        return [];
    }
}

export default async function HomePage() {
    const rawGroups = await getGroups();
    const activities = mockActivityItems; 
    
    const mappedGroups = rawGroups.map(g => ({
        id: String(g.id),
        title: g.nombre || g.name || "Sin nombre asignado",
        image: g.image || g.logo_url || g.logo || null
    }));
    
    // Mezclar y tomar solo 3
    const shuffledGroups = mappedGroups.sort(() => Math.random() - 0.5).slice(0, 3);

    return (
        <Box minH="100vh">
            <Box 
                textAlign="center" 
                backgroundImage="url('/background-1.jpg')"
                backgroundSize="cover"
                backgroundPosition="center"
                backgroundRepeat="no-repeat"
                color="white"
                >
                    <Box 
                        bgColor={'#33333399'} 
                        py={50} 
                        px={6} 
                    >
                        <Heading as="h1" size="2xl" mb={4}>
                            Grupos de Extensión de la UCV
                        </Heading>
                        <Paragraph fontSize="lg" maxW="600px" mx="auto" mb={2}>
                            Impulsa el impacto de tu conocimiento más allá del aula.
                        </Paragraph>
                        <Paragraph fontSize="lg" maxW="600px" mx="auto" mb={6}>
                            Nuestra plataforma te permite registrar, validar y respaldar grupos de extensión. Ya seas estudiante, docente o coordinador, puedes formalizar tus proyectos, darles reconocimiento académico y conectar tu trabajo con la sociedad.
                        </Paragraph>
                    </Box>
            </Box>
            <ClientContent 
                groups={shuffledGroups}
                activities={activities}
            />
        </Box>
    );
}
