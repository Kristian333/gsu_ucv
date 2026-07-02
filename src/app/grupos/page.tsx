// /app/grupos/page.tsx
import React from 'react';
import { ClientGroups } from '@/components/ui/client-grupos';
import { apiServerRequest } from "@/utils/apiServer";

interface GroupBackend {
    id: any;
    nombre?: string;
    name?: string;
    facultad?: string;
    faculty?: string;
    image?: string;
    logo_url?: string;
    logo?: string;
}

// Esta función ahora acepta los parámetros de paginación
async function getGroupsFromServer(page: number, limit: number) {
    try {
        // Petición optimizada al backend real de Go
        const responseData = await apiServerRequest(`groups?page=${page}&per_page=${limit}`, {
            next: { revalidate: 30 } // Cache inteligente pública por 30 segundos
        });

        return responseData?.grupos || responseData?.Groups || [];
    } catch (error) {
        console.error("PUBLIC GROUPS SERVER - Error cargando grupos:", error);
        return [];
    }
}

interface GruposPageProps {
    searchParams: { page?: string; search?: string; faculty?: string };
}

export default async function GruposPage({ searchParams }: GruposPageProps) {
    const page = Number(searchParams.page) || 1;
    const limit = 12; // Grupos por página (4 columnas)
    const search = searchParams.search || "";
    const faculty = searchParams.faculty || "";

    const rawGroups = await getGroupsFromServer(page, limit);

    // Mapeamos los nombres del struct de Go de manera segura a la interfaz original
    const mappedGroups = rawGroups.map((g: GroupBackend) => ({
        id: String(g.id),
        title: g.nombre || g.name || "Sin nombre asignado",
        faculty: g.facultad || g.faculty || "No asignada",
        image: g.image || g.logo_url || g.logo || null
    }));

    // Calculamos virtualmente el total de páginas ya que el backend no lo envía
    const totalPagesVirtual = rawGroups.length < limit ? page : page + 1;

    return (
        <ClientGroups 
            groups={mappedGroups} 
            currentPage={page} 
            totalPages={totalPagesVirtual} 
            currentSearch={search} 
            currentFaculty={faculty} 
            limit={limit}
        />
    );
}