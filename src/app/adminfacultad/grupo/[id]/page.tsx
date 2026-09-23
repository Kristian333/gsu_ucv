// app/adminfacultad/grupo/[id]/page.tsx
import { cache } from "react";
import { Metadata } from "next";
import { GroupDetailBackend } from "@/types/group";
import { apiServerRequest } from "@/utils/apiServer";
import GrupoAdminFacultadDetailClient from "@/components/ui/GrupoAdminFacultadDetailClient";

const getGroupData = cache(async (id: string): Promise<GroupDetailBackend | null> => {
  try {
    return await apiServerRequest(`groups/${id}`, { cache: "no-store" });
  } catch (error) {
    console.error(`[SSR] Error cargando grupo ${id}:`, error);
    return null;
  }
});

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const grupo = await getGroupData(params.id);
  return {
    title: grupo ? `${grupo.nombre} | Admin Facultad GSU` : "Grupo no encontrado | GSU",
  };
}

export default async function GrupoAdminFacultadDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const grupo = await getGroupData(params.id);

  return <GrupoAdminFacultadDetailClient grupo={grupo} />;
}
