// app/admin/grupo/[id]/usuario/editar/page.tsx

import { Box, Heading, Text } from "@chakra-ui/react";
import { Metadata } from "next";
import { apiServerRequest } from "@/utils/apiServer";
import { EditarPerfilForm } from "@/components/formularios/editar-perfil-form";
import { GroupDetailBackend } from "@/types/group";

export const metadata: Metadata = {
  title: "Editar Cuenta de Usuario | GSU",
};

async function getGroupOwnerId(groupId: string): Promise<string | null> {
  try {
    const groupData: GroupDetailBackend | null = await apiServerRequest(`groups/${groupId}`, {
      cache: "no-store",
    });
    return groupData?.propietario?.id ? String(groupData.propietario.id) : null;
  } catch (error) {
    console.error("Error obteniendo el propietario del grupo:", error);
    return null;
  }
}

export default async function EditarUsuarioGrupoPage({
  params,
}: {
  params: { id: string };
}) {
  const ownerId = await getGroupOwnerId(params.id);

  if (!ownerId) {
    return (
      <Box p={10} textAlign="center">
        <Heading size="lg">Usuario no encontrado</Heading>
        <Text mt={4} color="gray.500">
          No se pudo recuperar la cuenta del propietario de este grupo.
        </Text>
      </Box>
    );
  }

  return <EditarPerfilForm userId={ownerId} returnTo={`/admin/grupo/${params.id}/usuario`} />;
}
