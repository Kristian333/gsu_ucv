// app/adminfacultad/grupo/[id]/page.tsx
import { Metadata } from "next";
import { GroupDetailBackend } from "@/types/group";
import GrupoAdminFacultadDetailClient from "@/components/ui/GrupoAdminFacultadDetailClient";

async function getGroupData(id: string): Promise<GroupDetailBackend | null> {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    const res = await fetch(`${apiBaseUrl}/groups/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
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
