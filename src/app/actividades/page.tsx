// /app/actividades/page.tsx
import React from 'react';
import { Metadata } from "next";
import { ClientActivities } from '@/components/ui/client-actividades';
import { apiServerRequest } from "@/utils/apiServer";

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
    imagen_url?: string;
}

interface GroupBackend {
    id: any;
    nombre?: string;
    name?: string;
}

// Traer lista de grupos para poblar el dropdown de filtro
async function getGroups(): Promise<string[]> {
    try {
        const responseData = await apiServerRequest('groups', { cache: 'no-store' });
        const rawGroups: GroupBackend[] = responseData?.grupos || responseData?.Groups || [];
        return rawGroups.map(g => g.nombre || g.name || "").filter(Boolean);
    } catch (error) {
        console.error("ACTIVIDADES SERVER - Error obteniendo grupos:", error);
        return [];
    }
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
    try {
        const queryParams = new URLSearchParams();
        queryParams.set("page", page.toString());
        queryParams.set("per_page", limit.toString());

        if (group) {
            queryParams.set("group_id", group);
        }

        // --- Manejo de Filtros por Rango de Fecha / Estado ---
        const todayStr = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

        if (status === "futura") {
            // Actividades con fecha posterior a hoy
            queryParams.set("start_date", todayStr);
        } else if (status === "en_curso") {
            // Actividades en el día de hoy
            queryParams.set("date", todayStr);
        } else if (status === "finalizada") {
            // Actividades anteriores a hoy
            queryParams.set("end_date", todayStr);
        }

        const responseData = await apiServerRequest(`activities?${queryParams.toString()}`, {
            cache: 'no-store'
        });

        const rawActivities: ActivityBackend[] = responseData?.actividades || responseData?.Activities || [];
        const pageScope = responseData?.pagina || responseData?.PageScope || {};

        // Total de páginas calculadas desde el conteo que retorna el backend
        const totalCount = pageScope.count || rawActivities.length;
        const totalPages = Math.ceil(totalCount / limit) || 1;

        // Mapeo al formato consumido por la interfaz de usuario
        let mappedActivities = rawActivities.map((act) => {
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
                id: String(act.id),
                title: act.nombre || "Actividad sin título",
                description: act.descripcion || "",
                image: act.imagen_url || null,
                date_start: formattedDate,
                date_end: formattedDate,
                place: "Universidad Central de Venezuela",
                group: act.group_id ? `Grupo #${act.group_id}` : ""
            };
        });

        // Filtrado cliente secundario (Búsqueda por texto si la API aún no la procesa en DB)
        if (search.trim() !== "") {
            const query = search.toLowerCase();
            mappedActivities = mappedActivities.filter(act =>
                act.title.toLowerCase().includes(query) ||
                act.description.toLowerCase().includes(query)
            );
        }

        return {
            activities: mappedActivities,
            totalPages
        };
    } catch (error) {
        console.error("ACTIVIDADES SERVER - Error trayendo actividades:", error);
        return { activities: [], totalPages: 1 };
    }
}

interface ActividadesPageProps {
    searchParams: {
        page?: string;
        search?: string;
        group?: string;
        status?: string;
    };
}

export const metadata: Metadata = {
  title: "Actividades de Extensión | GSU",
  description: "Lista completa de nuestras actividades de extensión universitaria.",
};

export default async function ActividadesPage({ searchParams }: ActividadesPageProps) {
    const page = Number(searchParams.page) || 1;
    const search = searchParams.search || "";
    const group = searchParams.group || "";
    const status = searchParams.status || "";
    const limit = 6; // Cantidad de actividades por página

    // Obtención paralela de grupos y actividades
    const [allGroups, { activities, totalPages }] = await Promise.all([
        getGroups(),
        getActivities({ page, limit, search, group, status })
    ]);

    return (
        <ClientActivities
            activities={activities}
            allGroups={allGroups}
            currentPage={page}
            totalPages={totalPages}
            currentSearch={search}
            currentGroup={group}
            currentStatus={status}
        />
    );
}
