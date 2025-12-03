// /app/grupos/page.tsx
import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { ClientGroups } from '@/components/ui/client-grupos';
import { mockGroupItems } from "@/data/gruposMock";

interface GetGroupsParams {
  page: number;
  limit: number;
  search?: string;
  faculty?: string;
}

// Esta función ahora acepta los parámetros de paginación
async function getGroups({ page, limit, search = "", faculty = "" }: GetGroupsParams) {
    // Filtrar primero
    let filtered = mockGroupItems.filter(g =>
        g.title.toLowerCase().includes(search.toLowerCase())
    );

    if (faculty) {
        filtered = filtered.filter(g => g.faculty === faculty);
    }

    const totalGroups = filtered.length;
    const totalPages = Math.ceil(totalGroups / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const groups = filtered.slice(start, end);

    return { groups, totalPages };
}

interface GruposPageProps {
    searchParams: { page?: string; search?: string; faculty?: string };
}

export default async function GruposPage({ searchParams }: GruposPageProps) {
    const page = Number(searchParams.page) || 1;
    const limit = 12; // Cuantos grupos por página
    const search = searchParams.search || "";
    const faculty = searchParams.faculty || "";

    const { groups, totalPages } = await getGroups({ page, limit, search, faculty });

    return (
        <ClientGroups groups={groups} currentPage={page} totalPages={totalPages} currentSearch={search} currentFaculty={faculty} />
    );
}