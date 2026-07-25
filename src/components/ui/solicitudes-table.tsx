"use client";

import {
  Box,
  Button,
  ButtonGroup,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Text,
  Badge,
  Flex,
  Spinner,
} from '@chakra-ui/react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/context/auth-context'; 
import { apiRequest } from '@/components/formularios/api';
import { Pagination } from '@/components/ui/pagination'; 

const FACULTADES = [
  "Agronomía",
  "Arquitectura y Urbanismo",
  "Ciencias",
  "Ciencias Económicas y Sociales",
  "Ciencias Jurídicas y Políticas",
  "Ciencias Veterinarias",
  "Farmacia",
  "Humanidades y Educación",
  "Ingeniería",
  "Medicina",
  "Odontología",
  'DEU',
];

// Tipado de respuestas
interface SolicitudGrupo {
  id: string;
  grupo_id: string;
  comentarios: string;
  estado: string;
  facultad: string;
  creado_en: string;
}

interface SolicitudRecurso {
  id: string;
  grupo_id: string;
  tipo: string;
  contenido: string;
  estado: string;
  creado_en: string;
}

type TabType = 'groups' | 'resources';

const getBadgeColorScheme = (estado: string) => {
  switch (estado.toLowerCase()) {
    case 'under_review':
    case 'pendiente':
      return 'yellow';
    case 'approved':
    case 'aprobada':
      return 'green';
    case 'rejected':
    case 'rechazada':
      return 'red';
    default:
      return 'gray';
  }
};

const formatEstado = (estado: string) => {
  const map: Record<string, string> = {
    approved: 'Aprobada',
    pending: 'Pendiente',
    rejected: 'Rechazada',
  };
  return map[estado.toLowerCase()] || estado;
};

export function SolicitudesTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isHydrated } = useAuth();
  
  // Obtener la página actual directamente de los query params
  const pageParam = searchParams.get('page');
  const page = pageParam ? parseInt(pageParam, 10) : 1;
  
  const [activeTab, setActiveTab] = useState<TabType>('groups');
  const [facultad, setFacultad] = useState<string>(FACULTADES[0]); 
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Normalización de la facultad para la URL (espacios -> _)
  const formattedFacultad = facultad.replace(/\s+/g, '_');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'groups'
        ? `/admin/group-requests?faculty=${formattedFacultad}&page=${page}&per_page=20`
        : `/admin/group-resource-requests?faculty=${formattedFacultad}&page=${page}&pageSize=20`;
        
      // Llamada directa usando apiRequest (ya procesa el JSON)
      const result = await apiRequest(endpoint);

      setData(result.solicitudes || []);
      
      const totalCount = result.paginas?.count || 0;
      const perPage = result.paginas?.per_page || 20;
      setTotalPages(Math.ceil(totalCount / perPage) || 1);
    } catch (error) {
      console.error("Error cargando datos:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, formattedFacultad, page]);

  useEffect(() => {
    if (isHydrated) {
      fetchData();
    }
  }, [fetchData, isHydrated]);

  const handleTabChange = (type: TabType) => {
    setActiveTab(type);
    router.push(pathname);
  };

  const handleRowClick = (id: string) => {
    const route = activeTab === 'groups'
      ? `/admin/solicitud/${id}`
      : `/admin/solicitud_recurso/${id}`;
    router.push(route);
  };

  return (
    <Box>
      {/* Botones principales */}
      <ButtonGroup spacing={4} mb={6} size="md">
        <Button
          bg={activeTab === 'groups' ? 'primary' : 'transparent'}
          color={activeTab === 'groups' ? 'white' : 'primary'}
          border="1px solid"
          borderColor="primary"
          _hover={{
            bg: activeTab === 'groups' ? 'primary' : 'primary',
            color: activeTab === 'groups' ? 'white' : 'white',
          }}
          onClick={() => handleTabChange('groups')}
        >
          Solicitudes de Grupos
        </Button>
        <Button
          bg={activeTab === 'resources' ? 'primary' : 'transparent'}
          color={activeTab === 'resources' ? 'white' : 'primary'}
          border="1px solid"
          borderColor="primary"
          _hover={{
            bg: activeTab === 'resources' ? 'primary' : 'primary',
            color: activeTab === 'resources' ? 'white' : 'white',
          }}
          onClick={() => handleTabChange('resources')}
        >
          Solicitudes de Recursos
        </Button>
      </ButtonGroup>

      {/* Controles de Filtro por Facultad */}
      <Flex justify="space-between" align="center" mb={6} gap={4} wrap="wrap">
        <Box w={{ base: '100%', md: '320px' }}>
          <Text mb={2} fontWeight="bold" fontSize="sm">
            Filtrar por Facultad:
          </Text>
          <Select
            value={facultad}
            focusBorderColor="primary"
            onChange={(e) => {
              setFacultad(e.target.value);
              router.push(pathname); // Reset de página a 1 al cambiar filtro
            }}
          >
            {FACULTADES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </Select>
        </Box>
      </Flex>

      {/* Tabla */}
      <TableContainer border="1px" borderColor="gray.200" borderRadius="md" minH="400px">
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>ID</Th>
              <Th>ID Grupo</Th>
              {activeTab === 'groups' ? (
                <>
                  <Th>Facultad</Th>
                </>
              ) : (
                <>
                  <Th>Tipo de Recurso</Th>
                </>
              )}
              <Th>Fecha Creación</Th>
              <Th>Estado</Th>
            </Tr>
          </Thead>
          <Tbody>
            {loading ? (
              <Tr>
                <Td colSpan={6} textAlign="center" py={12}>
                  <Spinner size="lg" color="primary" />
                  <Text mt={2} color="gray.500">Cargando solicitudes...</Text>
                </Td>
              </Tr>
            ) : data.length > 0 ? (
              data.map((item) => (
                <Tr
                key={item.id}
                onClick={() => handleRowClick(item.id)}
                _hover={{ bg: 'gray.100', cursor: 'pointer' }}
                transition="background 0.15s ease-in-out"
                >
                  <Td fontWeight="bold">#{item.id}</Td>
                  <Td>{item.grupo_id}</Td>

                  {activeTab === 'groups' ? (
                    <>
                      <Td>{item.facultad}</Td>
                    </>
                  ) : (
                    <>
                      <Td>
                          <Badge colorScheme="purple">{item.tipo}</Badge>
                      </Td>
                    </>
                  )}

                  <Td>{new Date(item.creado_en).toLocaleDateString()}</Td>
                  <Td>
                      <Badge colorScheme={getBadgeColorScheme(item.estado)}>
                        {formatEstado(item.estado)}
                      </Badge>
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={6} textAlign="center" py={10}>
                  <Text color="gray.500">
                    No se encontraron solicitudes para esta facultad.
                  </Text>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Paginación */}
      {totalPages > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          basePath={pathname}
        />
      )}
    </Box>
  );
}