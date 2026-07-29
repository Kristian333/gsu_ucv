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
function formatDateDDMMYYYY(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

// Para formatear la fecha a mostrar en pantalla (DD/MM/YYYY) sin desfase por zona horaria
function formatDisplayDate(dateStr: string): string {
    if (!dateStr) return "";
    
    // Si viene en formato YYYY-MM-DD o ISO (2026-07-27T00:00:00Z)
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) return dateStr;

    // Usamos los métodos UTC para evitar que el timezone local cambie el día
    const day = String(dateObj.getUTCDate()).padStart(2, '0');
    const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
    const year = dateObj.getUTCFullYear();

    return `${day}/${month}/${year}`;
}

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
        const now = new Date();
        const todayStr = formatDateDDMMYYYY(now);

        if (status === "futura") {
            // Actividades con fecha posterior a hoy
            const tomorrow = new Date(now);
            tomorrow.setDate(now.getDate() + 1);

            const farFuture = new Date(now);
            farFuture.setFullYear(now.getFullYear() + 5);

            queryParams.set("start_date", formatDateDDMMYYYY(tomorrow));
            queryParams.set("end_date", formatDateDDMMYYYY(farFuture));
            
        } else if (status === "en_curso") {
            // Actividades en el día de hoy
            queryParams.set("start_date", todayStr);
            queryParams.set("end_date", todayStr);
        } else if (status === "finalizada") {
            // Actividades anteriores a hoy
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);

            const pastDate = new Date("2000-01-01");

            queryParams.set("start_date", formatDateDDMMYYYY(pastDate));
            queryParams.set("end_date", formatDateDDMMYYYY(yesterday));
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
            const formattedDate = formatDisplayDate(act.fecha);

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
