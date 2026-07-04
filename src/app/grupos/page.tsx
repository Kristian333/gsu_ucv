// /app/grupos/page.tsx
import React from 'react';
import { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Grupos de Extensión | GSU",
  description: "Lista completa de nuestros grupos de extensión universitaria.",
};

async function getGroupsFromServer(page: number, limit: number) {
    try {
        const responseData = await apiServerRequest(`groups?page=${page}&per_page=${limit}`, {
            next: { revalidate: 30 } 
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

    const mappedGroups = rawGroups.map((g: GroupBackend) => ({
        id: String(g.id),
        title: g.nombre || "Sin nombre asignado",
        faculty: g.facultad || "No asignada",
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