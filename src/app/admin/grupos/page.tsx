// /app/admin/grupos/page.tsx
import { Box, Heading, Text } from '@chakra-ui/react';
import { Metadata } from "next";
import { GroupsTable } from '@/components/ui/groups-table';
import { apiServerRequest } from "@/utils/apiServer";

interface GruposPageProps {
  searchParams: { 
    page?: string;
    faculty?: string;
    q?: string;
    active?: string;
  };
}

async function fetchGroupsFromBackend(params: { page: number; perPage: number; faculty?: string; q?: string; active?: string }) {
  try {
    const query = new URLSearchParams();
    query.set("page", String(params.page));
    query.set("per_page", String(params.perPage));

    if (params.faculty && params.faculty !== 'Todos') {
      query.set("faculty", params.faculty);
    }
    if (params.q) {
      query.set("q", params.q);
    }
    if (params.active !== undefined && params.active !== 'Todos') {
      query.set("active", params.active);
    }

    const responseData = await apiServerRequest(`groups?${query.toString()}`, {
      cache: 'no-store', 
    });
    
    return {
      groups: responseData?.grupos || responseData?.Groups || responseData?.groups || [],
      pageScope: responseData?.pagina || responseData?.page_scope || responseData?.PageScope || null
    };
  } catch (error) {
    console.error("ADMIN PAGE SERVER - Error cargando grupos:", error);
    return { groups: [], pageScope: null };
  }
}

export const metadata: Metadata = {
  title: "Grupos de Extensión en el Sistema | GSU",
  description: "Administra los Grupos de Extensión registrados en el sistema.",
};

export default async function GruposPage({ searchParams }: GruposPageProps) {
  const currentPage = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const perPage = 10;
  const faculty = searchParams.faculty || 'Todos';
  const searchQuery = searchParams.q || '';
  const activeStatus = searchParams.active || 'Todos';

  const { groups, pageScope } = await fetchGroupsFromBackend({
    page: currentPage,
    perPage,
    faculty,
    q: searchQuery,
    active: activeStatus,
  });

  // Calculamos el total de páginas según la respuesta del backend
  const totalPages = pageScope?.total_pages || pageScope?.TotalPages || (groups.length < perPage ? currentPage : currentPage + 1);

  return (
    <Box maxW="container.xl" mx="auto" py={10} px={6}>
      <Heading as="h1" size="xl" mb={2}>Gestión de Grupos</Heading>
      <Text fontSize="lg" color="gray.500" mb={8}>
        Administra los grupos registrados en la plataforma.
      </Text>
      
      <GroupsTable 
        initialGroups={groups} 
        currentPage={currentPage}
        totalPages={totalPages}
        currentFaculty={faculty}
        currentSearch={searchQuery}
        currentActive={activeStatus}
      />
    </Box>
  );
}