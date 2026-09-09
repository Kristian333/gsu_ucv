// /app/page.tsx
import React from 'react';
import { Box } from "@chakra-ui/react";
import { Heading, Paragraph } from "@/components/ui/tipografia";
import { ClientContent } from '../components/ui/client-components';
import { apiServerRequest } from "@/utils/apiServer";
import { formatDateToClient } from "@/utils/common";

interface GroupBackend {
    id: any;
    nombre?: string;
    imagen_url?: string;
}

interface ActivityBackend {
    id: string;
    group_id?: string;
    nombre_grupo?: string;
    nombre: string;
    descripcion: string;
    fecha?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    ubicacion: string;
    area_conocimiento?: string;
    aliados?: string;
    participantes_estimados?: number;
    participantes_reales?: number;
    financiamiento?: string;
    observaciones?: string;
    cubierta?: string;
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

// Función auxiliar para formatear la fecha a DD-MM-YYYY (lo que exige Go)
function formatDateForApiQuery(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

async function getActivities() {
    try {
        const now = new Date();
        const startDateStr = formatDateForApiQuery(now);
        
        const farFuture = new Date(now);
        farFuture.setFullYear(now.getFullYear() + 5);
        const endDateStr = formatDateForApiQuery(farFuture);

        // Construimos la URL con los parámetros que la API de Go requiere
        const queryParams = new URLSearchParams({
            per_page: "10",
            start_date: startDateStr,
            end_date: endDateStr,
            order: "asc" 
        });

        const responseData = await apiServerRequest(`activities?${queryParams.toString()}`, {
            cache: 'no-store'
        });

        const rawActivities: ActivityBackend[] = responseData?.actividades || responseData?.Activities || [];

        // Mapear la respuesta del backend al formato que consume el componente Carousel
        return rawActivities.map((act) => {
            // Evaluamos las propiedades que envíe la API
            const rawStart = act.fecha_inicio || act.fecha || "";
            const rawEnd = act.fecha_fin || act.fecha || act.fecha_inicio || "";

            return {
                id: Number(act.id) || act.id,
                title: act.nombre || "Actividad de Extensión",
                description: act.descripcion || "Sin descripción disponible.",
                image: act.cubierta || "/imagen-no-disponible.jpg",
                date_start: formatDateToClient(rawStart),
                date_end: formatDateToClient(rawEnd),
                place: act.ubicacion || "Universidad Central de Venezuela",
                group: act.nombre_grupo || `Grupo #${act.group_id}`,
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
        title: g.nombre || "Sin nombre asignado",
        image: g.imagen_url || "/imagen-no-disponible.jpg"
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
