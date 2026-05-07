// Este es un Server Component por defecto
import React from 'react';
import { Box } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import { Heading, Paragraph } from "@/components/ui/tipografia";
import { ClientContent } from '../components/ui/client-components';
import { mockGroupItems } from "@/data/gruposMock";
import { mockActivityItems } from "@/data/actividadesMock";

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
