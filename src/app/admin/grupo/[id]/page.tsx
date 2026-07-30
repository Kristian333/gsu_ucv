// app/admin/usuarios/[id]/page.tsx

import { apiServerRequest } from "@/utils/apiServer";
import GrupoDetalle from "@/components/ui/GrupoDetalle";
import { GroupDetailBackend } from "@/types/group";
import { Metadata } from "next";

async function getGroupData(id: string): Promise<GroupDetailBackend | null> {
  try {
    const data = await apiServerRequest(`groups/${id}`, { cache: "no-store" });
    return data || null;
  } catch (error) {
    console.error("Error cargando grupo:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const grupo = await getGroupData(params.id);
  return {
    title: grupo ? `${grupo.nombre} | GSU` : "Grupo no encontrado | GSU",
  };
}

export default async function GrupoAdminDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const grupo = await getGroupData(params.id);

  return <GrupoDetalle grupo={grupo} />;
}
