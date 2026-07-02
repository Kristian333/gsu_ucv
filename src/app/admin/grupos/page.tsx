// /app/admin/grupos/page.tsx
import { Box, Heading, Text } from '@chakra-ui/react';
import { GroupsTable } from '@/components/ui/groups-table';
import { apiServerRequest } from "@/utils/apiServer";

interface GruposPageProps {
  searchParams: { page?: string };
}

async function fetchGroupsFromBackend(page: number, perPage: number) {
  try {
    // Realiza la petición directa y segura en el servidor
    const responseData = await apiServerRequest(`groups?page=${page}&per_page=${perPage}`, {
      cache: 'no-store', // Evitamos caché rancia para paneles de administración
    });
    
    return responseData?.grupos || responseData?.Groups || [];
  } catch (error) {
    console.error("ADMIN PAGE SERVER - Error cargando grupos:", error);
    return [];
  }
}

export default async function GruposPage({ searchParams }: GruposPageProps) {
  // Capturamos el query param directamente en el servidor
  const currentPage = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const perPage = 10;

  const initialGroups = await fetchGroupsFromBackend(currentPage, perPage);

  return (
    <Box maxW="container.xl" mx="auto" py={10} px={6}>
      <Heading as="h1" size="xl" mb={4}>Gestión de Grupos</Heading>
      <Text fontSize="lg" color="gray.500" mb={8}>
        Administra los grupos registrados en la plataforma.
      </Text>
      
      <GroupsTable 
        initialGroups={initialGroups} 
        currentPage={currentPage}
        perPage={perPage}
      />
    </Box>
  );
}