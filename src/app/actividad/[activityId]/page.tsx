// app/actividad/[activityId]/page.tsx
import React from 'react';
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

async function getGroupData(groupId: string) {
  if (!groupId) return null;
  try {
    // Si el backend falla aquí, el catch evitará que se caiga la página pública
    return await apiServerRequest(`groups/${groupId}`, {
      cache: "no-store"
    });
  } catch (error) {
    console.error(`ACTIVITY DETAIL SERVER - Falló consulta de grupo id ${groupId}:`, error);
    return null;
  }
}

export default async function ActivityDetailPage({ params }: ActivityPageProps) {
  const activityId = params.activityId;
  const activityData = await getActivityData(activityId);

  if (!activityData) {
    return (
      <ActivityClientPage
        activityId={activityId}
        activity={null}
        linkedGroup={null}
      />
    );
  }

  // Intentamos obtener el grupo asociado de forma controlada
  const groupData = await getGroupData(activityData.group_id);

  // Mapeamos de forma limpia el grupo si se encontró
  const linkedGroup = groupData ? {
    id: String(groupData.id || activityData.group_id),
    title: groupData.nombre || groupData.name || "Grupo de Extensión"
  } : null;

  return (
    <ActivityClientPage
      activityId={activityId}
      activity={activityData}
      linkedGroup={linkedGroup}
    />
  );
}
