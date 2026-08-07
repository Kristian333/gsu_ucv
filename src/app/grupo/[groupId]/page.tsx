// app/grupo/[groupId]/page.tsx
import React from 'react';
import { Metadata } from 'next';
import GroupClientPage from "@/components/ui/grupo";
import { apiServerRequest } from "@/utils/apiServer";
import { notFound } from "next/navigation";

interface GroupBackendResponse {
  id: string;
  nombre?: string;
  descripcion?: string;
  ubicacion?: string;
  imagen_url?: string;
  email?: string;
  telefono?: string;
  facultad?: string;
  fundacion?: string;
  awards?: { awardName: string; awarddate: number }[] | string;
}

interface ActivityBackend {
  id: string | number;
  nombre?: string;
  cubierta?: string;
}

interface Props {
  params: { groupId: string };
}

async function getGroupData(groupId: string) {
  try {
    const data = await apiServerRequest(`groups/${groupId}`, { cache: 'no-store' });
    if (!data || !data.id) return null;
    return data as GroupBackendResponse;
  } catch (error) {
    console.error(`Error obteniendo el grupo ${groupId}:`, error);
    return null;
  }
}

async function getGroupActivities(groupId: string) {
  try {
    // Pedimos las primeras 4 actividades destacadas asociadas a este grupo
    const queryParams = new URLSearchParams({
      group_id: groupId,
      is_featured: "true",
      per_page: "4",
      page: "1"
    });

    const responseData = await apiServerRequest(`activities?${queryParams.toString()}`, { cache: 'no-store' });
    const rawActivities: ActivityBackend[] = responseData?.actividades || responseData?.Activities || [];

    return rawActivities.map((act) => ({
      id: act.id,
      title: act.nombre || "Actividad sin título",
      image: act.cubierta || "/imagen-no-disponible.jpg", 
      group: groupId
    }));
  } catch (error) {
    console.error(`Error obteniendo actividades destacadas para el grupo ${groupId}:`, error);
    return [];
  }
}

function formatDisplayDate(dateStr: string | undefined): string {
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

// Generación de Metadata Dinámica para la pestaña del navegador
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const group = await getGroupData(params.groupId);
  
  if (!group) {
    return {
      title: "Grupo no encontrado | GSU",
    };
  }

  return {
    title: `${group.nombre || "Detalle del Grupo"} | GSU`,
    description: group.descripcion?.slice(0, 160) || "Información del grupo de extensión universitaria.",
  };
}

export default async function GroupDetailPage({ params }: Props) {
  const groupId = params.groupId;

  // Consultas en paralelo
  const [rawGroup, activities] = await Promise.all([
    getGroupData(groupId),
    getGroupActivities(groupId)
  ]);

  if (!rawGroup) {
    return notFound();
  }

  // Mapeo a la interfaz que espera el componente de cliente (con placeholders)
  const groupFormatted = {
    id: String(rawGroup.id),
    title: rawGroup.nombre || "Grupo sin nombre",
    image: rawGroup.imagen_url || "/imagen-no-disponible.jpg",
    objetive: rawGroup.descripcion || "No hay una descripción u objetivo registrado para este grupo.",
    faculty: rawGroup.facultad || "Facultad no especificada",
    email: rawGroup.email || undefined, 
    phone: rawGroup.telefono || undefined,
    foundation: formatDisplayDate(rawGroup.fundacion) || undefined,
    awards: rawGroup.awards || []
  };

  return (
    <GroupClientPage
      groupId={groupId}
      group={groupFormatted}
      activities={activities}
    />
  );
}
