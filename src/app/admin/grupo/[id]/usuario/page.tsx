// app/admin/grupos/[id]/usuario/page.tsx

import { apiServerRequest } from "@/utils/apiServer";
import UsuarioGrupoDetalle from "@/components/ui/UsuarioGrupoDetalle";
import { GroupDetailBackend } from "@/types/group";
import { UserDetailBackend } from "@/types/user";
import { Metadata } from "next";


async function getGroupData(Id: string): Promise<GroupDetailBackend | null> {
  try {
    const groupData = await apiServerRequest(`groups/${Id}`, {
      cache: "no-store",
    });
    return groupData || null;
  } catch (error) {
    console.error("Error obteniendo usuario del propietario:", error);
    return null;
  }
}

async function getGroupOwnerUser(groupId: string): Promise<UserDetailBackend | null> {
  try {
    const groupData: GroupDetailBackend | null = await apiServerRequest(`groups/${groupId}`, {
      cache: "no-store",
    });

        if (!groupData || !groupData.propietario?.id) {
        return null;
        }

    const userData: UserDetailBackend | null = await apiServerRequest(
      `users/${groupData.propietario.id}`,
      { cache: "no-store" }
    );

    return userData || null;
  } catch (error) {
    console.error("Error obteniendo usuario del propietario:", error);
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
    title: grupo ? "Cuenta de Usuario de " + `${grupo.nombre} | GSU` : "Cuenta de Usuario | GSU",
  };
}

export default async function GrupoUsuarioPage({
  params,
}: {
  params: { id: string };
}) {
  const usuario = await getGroupOwnerUser(params.id);

  return <UsuarioGrupoDetalle usuario={usuario} />;
}