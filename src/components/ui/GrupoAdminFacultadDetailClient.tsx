// app/adminfacultad/grupos/[id]/GrupoAdminFacultadDetailClient.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Center, Spinner, Box } from "@chakra-ui/react";
import GrupoDetalle from "@/components/ui/GrupoDetalle";
import { useAuth } from "@/app/context/auth-context";
import { GroupDetailBackend } from "@/types/group";

interface Props {
  grupo: GroupDetailBackend | null;
}

export default function GrupoAdminFacultadDetailClient({ grupo }: Props) {
  const { user, isHydrated } = useAuth();
  const router = useRouter();

  const userFaculty = user?.facultad || (typeof window !== "undefined" ? localStorage.getItem("facultad") || "" : "");

  useEffect(() => {
    if (!isHydrated) return;

    // Si el grupo existe pero no pertenece a la facultad del usuario actual, redirigir inmediatamente
    if (grupo && userFaculty) {
      const normalize = (str: string) => str.trim().toLowerCase();
      if (normalize(grupo.facultad) !== normalize(userFaculty)) {
        router.replace("/adminfacultad/grupos");
      }
    }
  }, [grupo, userFaculty, isHydrated, router]);

  if (!isHydrated) {
    return (
      <Center py={20}>
        <Spinner size="xl" color="teal.500" />
      </Center>
    );
  }

  if (grupo && userFaculty && grupo.facultad.trim().toLowerCase() !== userFaculty.trim().toLowerCase()) {
    return (
      <Center py={20}>
        <Spinner size="xl" color="red.500" />
      </Center>
    );
  }

  return (
    <Box maxW="container.xl" mx="auto" py={8} px={6}>
      <GrupoDetalle grupo={grupo} />
    </Box>
  );
}