// /app/grupos/page.tsx
import React from 'react';
import { Metadata } from "next";
import { ClientGroups } from '@/components/ui/client-grupos';
import { apiServerRequest } from "@/utils/apiServer";

interface GroupBackend {
    id: any;
    nombre?: string;
    facultad?: string;
    imagen_url?: string;
}

interface PageScope {
    page: number;
    per_page: number;
    total_pages: number;
    total_records: number;
}

interface GetGroupsResponse {
    grupos?: GroupBackend[];
    groups?: GroupBackend[];
    page_scope?: PageScope;
    PageScope?: PageScope;
}

export const metadata: Metadata = {
  title: "Grupos de Extensión | GSU",
  description: "Lista completa de nuestros grupos de extensión universitaria.",
};

async function getGroupsFromServer(page: number, limit: number, search: string, faculty: string) {
    try {
        const queryParams = new URLSearchParams({
            page: String(page),
            per_page: String(limit),
        });

        if (search) {
            queryParams.append("q", search);
        }

        if (faculty) {
            queryParams.append("faculty", faculty);
        }

        const responseData: GetGroupsResponse = await apiServerRequest(`groups?${queryParams.toString()}`, {
            next: { revalidate: 0 } 
        });

        const rawGroups = responseData?.grupos || responseData?.groups || [];
        const scope = responseData?.page_scope || responseData?.PageScope;

        return {
            groups: rawGroups,
            totalPages: scope?.total_pages || (rawGroups.length < limit ? page : page + 1),
        };
    } catch (error) {
        console.error("PUBLIC GROUPS SERVER - Error cargando grupos:", error);
        return { groups: [], totalPages: 1 };
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

    const { groups: rawGroups, totalPages } = await getGroupsFromServer(page, limit, search, faculty);

    const mappedGroups = rawGroups.map((g: GroupBackend) => ({
        id: String(g.id),
        title: g.nombre || "Sin nombre asignado",
        faculty: g.facultad || "No asignada", 
        image: g.imagen_url || "/imagen-no-disponible.jpg"
    }));

    return (
        <ClientGroups 
            groups={mappedGroups} 
            currentPage={page} 
            totalPages={totalPages} 
            currentSearch={search} 
            currentFaculty={faculty} 
            limit={limit}
        />
    );
}