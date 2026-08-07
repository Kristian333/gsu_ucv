// app/adminfacultad/AdminFacultadContent.tsx
"use client";

import { useEffect, useState } from "react";
import { Box, Heading, Text, Spinner, Center } from "@chakra-ui/react";
import { GroupsTable } from "@/components/ui/groups-table";
import { useAuth } from "@/app/context/auth-context";

interface AdminFacultadContentProps {
  searchParams: {
    page?: string;
    q?: string;
    active?: string;
  };
}

export function AdminFacultadContent({ searchParams }: AdminFacultadContentProps) {
  const { user, token, isHydrated } = useAuth();
  
  const [groups, setGroups] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  // Extraer facultad del usuario autenticado o del localStorage si fallara el estado
  const faculty = user?.facultad || (typeof window !== "undefined" ? localStorage.getItem("facultad") || "" : "");

  const currentPage = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const searchQuery = searchParams.q || "";
  const activeStatus = searchParams.active || "Todos";

  useEffect(() => {
    // Esperar a que Next/AuthContext se hidrate desde localStorage
    if (!isHydrated) return;

    async function loadFacultyGroups() {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        query.set("page", String(currentPage));
        query.set("per_page", "10");
        if (faculty) query.set("faculty", faculty);
        if (searchQuery) query.set("q", searchQuery);
        if (activeStatus !== "Todos") query.set("active", activeStatus);

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || ""; 
        const storedToken = token || localStorage.getItem("token");

        const res = await fetch(`${apiBaseUrl}/groups?${query.toString()}`, {
          headers: {
            "Content-Type": "application/json",
            ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
          },
        });

        if (!res.ok) throw new Error("Error al obtener los grupos");

        const responseData = await res.json();

        const fetchedGroups = responseData?.grupos || responseData?.Groups || responseData?.groups || [];
        const pageScope = responseData?.pagina || responseData?.page_scope || responseData?.PageScope;

        setGroups(fetchedGroups);
        setTotalPages(
          pageScope?.total_pages ||
          pageScope?.TotalPages ||
          (fetchedGroups.length < 10 ? currentPage : currentPage + 1)
        );
      } catch (err) {
        console.error("ADMIN FACULTAD CLIENT - Error cargando grupos:", err);
      } finally {
        setLoading(false);
      }
    }

    loadFacultyGroups();
  }, [isHydrated, faculty, currentPage, searchQuery, activeStatus, token]);

  if (!isHydrated || loading) {
    return (
      <Center py={20}>
        <Spinner size="xl" color="teal.500" />
      </Center>
    );
  }

  return (
    <Box maxW="container.xl" mx="auto" py={10} px={6}>
      <Heading as="h1" size="xl" mb={2} textTransform="capitalize">
        {faculty ? `Grupos de Extensión - Facultad de ${faculty}` : "Grupos de Extensión de la Facultad"}
      </Heading>
      <Text fontSize="lg" color="gray.500" mb={8}>
        Gestiona y revisa los grupos adscritos a tu facultad.
      </Text>

      <GroupsTable
        initialGroups={groups}
        currentPage={currentPage}
        totalPages={totalPages}
        currentFaculty={faculty}
        currentSearch={searchQuery}
        currentActive={activeStatus}
        hideFacultyFilter={true}
        showFacultyColumn={false}
        basePath="/adminfacultad"
      />
    </Box>
  );
}