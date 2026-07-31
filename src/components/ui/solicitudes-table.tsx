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

interface SolicitudesTableProps {
  mode?: 'admin' | 'faculty';
  defaultFaculty?: string;
}

const getBadgeColorScheme = (estado: string) => {
  switch (estado?.toLowerCase()) {
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
  if (!estado) return '';
  const map: Record<string, string> = {
    under_review: 'En Revisión',
    approved: 'Aprobada',
    pending: 'Pendiente',
    rejected: 'Rechazada',
  };
  return map[estado.toLowerCase()] || estado;
};

export function SolicitudesTable({ mode = 'admin', defaultFaculty }: SolicitudesTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isHydrated } = useAuth();
  
  const pageParam = searchParams.get('page');
  const page = pageParam ? parseInt(pageParam, 10) : 1;
  
  const tabParam = searchParams.get('tab') as TabType;
  const activeTab: TabType = mode === 'faculty' ? 'groups' : (tabParam || 'groups');

  const facultyParam = searchParams.get('faculty');
  
  // En modo faculty, priorizamos el Context -> props -> primer ítem del array
  const facultyFromAuth = user?.facultad;
  const initialFaculty = mode === 'faculty' 
    ? (facultyFromAuth || defaultFaculty || FACULTADES[0])
    : (facultyParam || FACULTADES[0]);

  const [facultad, setFacultad] = useState<string>(initialFaculty);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    if (mode === 'faculty' && facultyFromAuth) {
      setFacultad(facultyFromAuth);
    }
  }, [mode, facultyFromAuth]);

  // Helper para actualizar query params
  const updateQueryParams = (newParams: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const formattedFacultad = facultad.replace(/\s+/g, '_');

  const fetchData = useCallback(async () => {
    if (!facultad) return;
    setLoading(true);
    try {
      const endpoint = activeTab === 'groups'
        ? `/admin/group-requests?faculty=${formattedFacultad}&page=${page}&per_page=20`
        : `/admin/group-resource-requests?faculty=${formattedFacultad}&page=${page}&pageSize=20`;
        
      const result = await apiRequest(endpoint);

      setData(result.solicitudes || result.requests || []);
      
      const totalCount = result.paginas?.count || result.pages?.count || 0;
      const perPage = result.paginas?.per_page || result.pages?.per_page || 20;
      setTotalPages(Math.ceil(totalCount / perPage) || 1);
    } catch (error) {
      console.error("Error cargando datos:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, formattedFacultad, page, facultad]);

  useEffect(() => {
    if (isHydrated) {
      fetchData();
    }
  }, [fetchData, isHydrated]);

  const handleTabChange = (type: TabType) => {
    updateQueryParams({ tab: type, page: 1 });
  };

  const handleFacultyChange = (newFaculty: string) => {
    setFacultad(newFaculty);
    updateQueryParams({ faculty: newFaculty, page: 1 });
  };

  const handleRowClick = (id: string) => {
    let route = "";
    if (mode === 'faculty') {
      route = `/adminfacultad/solicitud/${id}`;
    } else {
      route = activeTab === 'groups'
        ? `/admin/solicitud/${id}`
        : `/admin/solicitud_recurso/${id}`;
    }
    router.push(route);
  };

  return (
    <Box>
      {/* Pestañas: modo admin */}
      {mode === 'admin' && (
        <ButtonGroup spacing={4} mb={6} size="md">
          <Button
            bg={activeTab === 'groups' ? 'primary.600' : 'transparent'}
            color={activeTab === 'groups' ? 'white' : 'primary.600'}
            border="1px solid"
            borderColor="primary.600"
            _hover={{ bg: activeTab === 'groups' ? 'primary.700' : 'primary.50' }}
            onClick={() => handleTabChange('groups')}
          >
            Solicitudes de Grupos
          </Button>
          <Button
            bg={activeTab === 'resources' ? 'primary.600' : 'transparent'}
            color={activeTab === 'resources' ? 'white' : 'primary.600'}
            border="1px solid"
            borderColor="primary.600"
            _hover={{ bg: activeTab === 'resources' ? 'primary.700' : 'primary.50' }}
            onClick={() => handleTabChange('resources')}
          >
            Solicitudes de Recursos
          </Button>
        </ButtonGroup>
      )}

      {/* Selector de Facultad: modo admin */}
      {mode === 'admin' && (
        <Flex justify="space-between" align="center" mb={6} gap={4} wrap="wrap">
          <Box w={{ base: '100%', md: '320px' }}>
            <Text mb={2} fontWeight="bold" fontSize="sm">
              Filtrar por Facultad:
            </Text>
            <Select
              value={facultad}
              focusBorderColor="primary.500"
              onChange={(e) => handleFacultyChange(e.target.value)}
            >
              {FACULTADES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </Select>
          </Box>
        </Flex>
      )}

      {/* Tabla */}
      <TableContainer border="1px" borderColor="gray.200" borderRadius="md" minH="400px">
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>ID Grupo</Th>
              <Th>Facultad</Th>
              {activeTab === 'groups' ? (
                  null
              ) : (
                  <Th>Tipo de Recurso</Th>
              )}
              <Th>Fecha Creación</Th>
              <Th>Estado</Th>
            </Tr>
          </Thead>
          <Tbody>
            {loading ? (
              <Tr>
                <Td colSpan={5} textAlign="center" py={12}>
                  <Spinner size="lg" color="primary.500" />
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
                  <Td>{item.grupo_id}</Td>
                  <Td>{item.facultad || facultad}</Td>

                  {activeTab === 'groups' ? (
                      null
                  ) : (
                      <Td>
                          <Badge colorScheme="secondary">{item.tipo}</Badge>
                      </Td>
                  )}

                  <Td>
                    {new Date(item.creado_en).toLocaleDateString()}
                  </Td>
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
        <Box mt={4}>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath={pathname}
          />
        </Box>
      )}
    </Box>
  );
}