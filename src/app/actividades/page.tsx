// /app/actividades/page.tsx
import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { ClientActivities } from '@/components/ui/client-actividades';
import { mockActivityItems } from "@/data/actividadesMock";

function getUniqueGroups() {
    const groups = mockActivityItems.map(a => a.group).filter(Boolean);
    return Array.from(new Set(groups));
}

function filterActivities(data: any[], search: string, group: string, status: string) {
    const today = new Date().toISOString().split("T")[0];

    return data.filter(act => {
        const matchesSearch =
            search.trim() === "" ||
            act.title.toLowerCase().includes(search.toLowerCase()) ||
            act.description.toLowerCase().includes(search.toLowerCase());

        const matchesGroup =
            group === "" || act.group === group;

        let matchesStatus = true;
        if (status === "futura") {
            matchesStatus = act.date_start > today;
        } else if (status === "curso") {
            matchesStatus = act.date_start <= today && act.date_end >= today;
        } else if (status === "finalizada") {
            matchesStatus = act.date_end < today;
        }

        return matchesSearch && matchesGroup && matchesStatus;
    });
}

function sortActivities(data: any[]) {
    const today = new Date().toISOString().split("T")[0];

    const upcomingOrOngoing = [];
    const past = [];

    for (const act of data) {
       
        if (act.date_start > today) {
            upcomingOrOngoing.push(act);
        } else if (act.date_start <= today && act.date_end >= today) {
            upcomingOrOngoing.push(act);
        } else {
            past.push(act);
        }
    }

    upcomingOrOngoing.sort((a, b) => (a.date_start > b.date_start ? 1 : -1));


    past.sort((a, b) => (a.date_end < b.date_end ? 1 : -1));

    // Concatenar ambos grupos
    return [...upcomingOrOngoing, ...past];
}


async function getActivities({
    page,
    limit,
    search,
    group,
    status
}: {
    page: number;
    limit: number;
    search: string;
    group: string;
    status: string;
}) {
    const filtered = filterActivities(mockActivityItems, search, group, status);

    const sorted = sortActivities(filtered);

    const start = (page - 1) * limit;
    const end = start + limit;

    const activities = sorted.slice(start, end);
    const totalActivities = sorted.length;
    const totalPages = Math.ceil(totalActivities / limit);

    return { activities, totalPages };
}

interface ActividadesPageProps {
    searchParams: {
        page?: string;
        search?: string;
        group?: string;
        status?: string;
    };
}

export default async function ActividadesPage({ searchParams }: ActividadesPageProps) {
    const page = Number(searchParams.page) || 1;
    const search = searchParams.search || "";
    const group = searchParams.group || "";
    const status = searchParams.status || "";
    const limit = 6; // Cantidad de actividades por página

    const uniqueGroups = getUniqueGroups();

    const { activities, totalPages } = await getActivities({
        page,
        limit,
        search,
        group,
        status,
    });

    return (
        <ClientActivities
            activities={activities}
            allGroups={uniqueGroups}
            currentPage={page}
            totalPages={totalPages}
            currentSearch={search}
            currentGroup={group}
            currentStatus={status}
        />
    );
}
