// /app/page.tsx
import React from 'react';
import { Box } from "@chakra-ui/react";
import { Heading, Paragraph } from "@/components/ui/tipografia";
import { ClientContent } from '../components/ui/client-components';
import { apiServerRequest } from "@/utils/apiServer"; 

interface GroupBackend {
    id: any;
    nombre?: string;
    name?: string;
    image?: string;
    logo_url?: string;
    logo?: string;
}

interface ActivityBackend {
    id: string;
    group_id?: string;
    nombre: string;
    descripcion: string;
    fecha: string;
    area_conocimiento?: string;
    aliados?: string;
    participantes_estimados?: number;
    participantes_reales?: number;
    financiamiento?: string;
    observaciones?: string;
    imagen_url?: string; // Por si el backend añade o devuelve imagen
}

async function getRandomGroups(): Promise<GroupBackend[]> {
    try {
        const responseData = await apiServerRequest('groups?random=true&limit=3', {
            cache: 'no-store'
        });
        return responseData?.grupos || responseData?.Groups || [];
    } catch (error) {
        console.error("HOME SERVER - Error trayendo grupos aleatorios:", error);
        return [];
    }
}

async function getActivities() {
    try {
        // Formatear la fecha actual a YYYY-MM-DD o DD-MM-YYYY según requiera la API
        const todayStr = new Date().toISOString().split('T')[0];

        // Se pueden pasar filtros de fecha si se desea, por ejemplo start_date y end_date 
        // o pedir una página con límite razonable para el carrusel (ej: per_page=10)
        const responseData = await apiServerRequest(`activities?per_page=10`, {
            cache: 'no-store'
        });

        const rawActivities: ActivityBackend[] = responseData?.actividades || responseData?.Activities || [];

        // Mapear la respuesta del backend al formato que consume el componente Carousel
        return rawActivities.map((act) => {
            // Formateo sencillo de la fecha ISO "2025-11-30T00:00:00Z" -> "30/11/2025"
            let formattedDate = "";
            if (act.fecha) {
                const dateObj = new Date(act.fecha);
                formattedDate = dateObj.toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
            }

            return {
                id: Number(act.id) || act.id,
                title: act.nombre || "Actividad de Extensión",
                description: act.descripcion || "Sin descripción disponible.",
                image: act.imagen_url || "https://placehold.co/1200x500/01695b/ffffff/png?text=Actividad+de+Extensión",
                date_start: formattedDate,
                date_end: formattedDate,
                place: "Universidad Central de Venezuela",
                group: act.group_id ? `Grupo #${act.group_id}` : "General",
                area: act.area_conocimiento ? [act.area_conocimiento] : []
            };
        });
    } catch (error) {
        console.error("HOME SERVER - Error trayendo actividades:", error);
        return [];
    }
}

export default async function HomePage() {
    // Peticiones en paralelo para mayor velocidad de carga
    const [rawGroups, mappedActivities] = await Promise.all([
        getRandomGroups(),
        getActivities()
    ]);
    
    const mappedGroups = rawGroups.map(g => ({
        id: String(g.id),
        title: g.nombre || g.name || "Sin nombre asignado",
        image: g.image || g.logo_url || g.logo || null
    }));
    
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
                groups={mappedGroups}
                activities={mappedActivities}
            />
        </Box>
    );
}
