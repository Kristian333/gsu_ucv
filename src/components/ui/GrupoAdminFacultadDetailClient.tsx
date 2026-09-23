// app/adminfacultad/grupos/[id]/GrupoAdminFacultadDetailClient.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Center, Spinner, Box } from "@chakra-ui/react";
import GrupoDetalle from "@/components/ui/GrupoDetalle";
import { useAuth } from "@/app/context/auth-context";
import { GroupDetailBackend } from "@/types/group";
import { parseFacultiesList } from "@/utils/common";

interface Props {
  grupo: GroupDetailBackend | null;
}

export default function GrupoAdminFacultadDetailClient({ grupo }: Props) {
  const { user, isHydrated } = useAuth();
  const router = useRouter();

  const userFaculty = user?.facultad || (typeof window !== "undefined" ? localStorage.getItem("facultad") || "" : "");

  const normalize = (str: string) =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const perteneceAFacultad = (
    facultadGrupo: GroupDetailBackend["facultad"] | undefined | null,
    facultadUsuario: string
  ) => {
    if (!facultadGrupo || !facultadUsuario) return false;
    const facultades = parseFacultiesList(facultadGrupo);
    const usuarioNorm = normalize(facultadUsuario);

    return facultades.some((f) => normalize(f) === usuarioNorm);
  };

  const esAccesoValido = grupo && userFaculty ? perteneceAFacultad(grupo.facultad, userFaculty) : true;

  useEffect(() => {
    if (!isHydrated) return;

    if (grupo && userFaculty && !esAccesoValido) {
      router.replace("/adminfacultad/grupos");
    }
  }, [grupo, userFaculty, isHydrated, esAccesoValido, router]);

  if (!isHydrated) {
    return (
      <Center py={20}>
        <Spinner size="xl" color="teal.500" />
      </Center>
    );
  }

  if (!grupo) {
    return <GrupoDetalle grupo={null} />;
  }

  if (userFaculty && !esAccesoValido) {
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