// /app/actividades/page.tsx
import React from 'react';
import { Metadata } from "next";
import { ClientActivities } from '@/components/ui/client-actividades';
import { apiServerRequest } from "@/utils/apiServer";

interface ActivityBackend {
    id: string;
    group_id?: string;
    nombre_grupo?: string;
    nombre: string;
    descripcion: string;
    fecha: string;
    ubicacion: string;
    area_conocimiento?: string;
    aliados?: string;
    participantes_estimados?: number;
    participantes_reales?: number;
    financiamiento?: string;
    observaciones?: string;
    cubierta?: string;
}

interface GroupOption {
  id: string;
  nombre: string;
}

// Traer lista de grupos para poblar el dropdown de filtro
function formatDateDDMMYYYY(date: Date): string {
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
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

async function getAllGroups(): Promise<GroupOption[]> {
    const allGroups: GroupOption[] = [];
    let page = 1;
    const perPage = 50; // Traer páginas grandes para minimizar peticiones
    let totalPages = 1;

    try {
        do {
            const responseData = await apiServerRequest(`groups?page=${page}&per_page=${perPage}`, { cache: 'no-store' });
            const rawGroups = responseData?.grupos || responseData?.Groups || [];
            const pageScope = responseData?.pagina || responseData?.PageScope || {};

            const count = pageScope.count || rawGroups.length;
            totalPages = Math.ceil(count / perPage) || 1;

            for (const g of rawGroups) {
                if (g.id && g.nombre) {
                    allGroups.push({
                        id: String(g.id),
                        nombre: g.nombre,
                    });
                }
            }

            page++;
        } while (page <= totalPages);

        return allGroups;
    } catch (error) {
        console.error("ACTIVIDADES SERVER - Error obteniendo grupos completos:", error);
        return allGroups;
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
        queryParams.set("order", "desc");

        if (group) {
            queryParams.set("group_id", group);
        }

        if (search) {
            queryParams.set("name", search); 
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
        const totalCount = pageScope.count ?? rawActivities.length;
        const totalPages = Math.ceil(totalCount / limit) || 1;

        // Mapeo al formato consumido por la interfaz de usuario
        const mappedActivities = rawActivities.map((act) => {
            const formattedDate = formatDisplayDate(act.fecha);

            return {
                id: String(act.id),
                title: act.nombre || "Actividad sin título",
                description: act.descripcion || "",
                image: act.cubierta || null,
                date_start: formattedDate,
                date_end: formattedDate,
                place: act.ubicacion || "Universidad Central de Venezuela",
                group: act.nombre_grupo || (act.group_id ? `Grupo #${act.group_id}` : "")
            };
        });

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
        getAllGroups(),
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
