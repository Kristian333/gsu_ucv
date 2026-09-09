// app/actividad/[activityId]/page.tsx
import React from 'react';
import { Metadata } from "next";
import ActivityClientPage from "@/components/ui/actividad";
import { apiServerRequest } from "@/utils/apiServer";

interface ActivityPageProps {
  params: { activityId: string };
}

async function getActivityData(activityId: string) {
  try {
    return await apiServerRequest(`activities/${activityId}`, {
      cache: "no-store"
    });
  } catch (error) {
    console.error("ACTIVITY DETAIL SERVER - Error cargando actividad:", error);
    return null;
  }
}

export async function generateMetadata({ params }: ActivityPageProps): Promise<Metadata> {
  const activityData = await getActivityData(params.activityId);

  // Si por alguna razón la API no responde o no existe la actividad, manejamos un fallback elegante
  if (!activityData) {
    return {
      title: "Actividad no encontrada | GSU",
      description: "La actividad universitaria solicitada no se encuentra disponible.",
    };
  }

  // Si todo sale bien, extraemos el nombre de la actividad (ajusta la clave según tu backend)
  const nombreActividad = activityData.nombre || `Actividad #${params.activityId}`;
  const descripcionActividad = activityData.descripcion || "Detalles de nuestra actividad de extensión universitaria.";

  return {
    title: `${nombreActividad} | GSU`,
  description: descripcionActividad,
  };
}

export default async function ActivityDetailPage({ params }: ActivityPageProps) {
  const activityId = params.activityId;
  const activityData = await getActivityData(activityId);

  return (
    <ActivityClientPage
      activityId={activityId}
      activity={activityData}
    />
  );
}
