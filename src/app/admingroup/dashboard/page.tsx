// /app/admingroup/dashboard/page.tsx
import React from "react";
import { apiServerRequest } from "@/utils/apiServer";
import { GroupDashboardContent } from "@/components/ui/group-dashboard-content";

interface DashboardPageProps {
  searchParams: { userId?: string };
}

async function fetchUserGroupFromServer(userId: string) {
  try {
    // Solicitamos la lista directo al backend desde el servidor
    const data = await apiServerRequest("groups?per_page=100", {
      cache: "no-store",
    });
    const listaGrupos = data?.grupos || data?.Groups || [];

    // Buscamos eficientemente en el servidor el grupo que le pertenece al usuario
    return listaGrupos.find(
      (g: any) => g.propietario && String(g.propietario.id).trim() === String(userId).trim()
    ) || null;
  } catch (error) {
    console.error("GROUP DASHBOARD SERVER - Error buscando grupo:", error);
    return null;
  }
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const userId = searchParams.userId;

  // Si ya tenemos el ID en la URL, resolvemos la búsqueda del grupo en el Servidor
  const miGrupo = userId ? await fetchUserGroupFromServer(userId) : null;

  return <GroupDashboardContent miGrupo={miGrupo} />;
}