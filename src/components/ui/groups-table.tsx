// /components/ui/groups-table.tsx
"use client";

import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Box,
  Text,
  Badge,
  Button,
  Select,
  Image,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Flex,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { SearchIcon, CloseIcon } from '@chakra-ui/icons';
import { Pagination } from "@/components/ui/pagination";
import { FACULTADES_FILTRO } from '@/constants/facultades';
import { parseFacultiesList } from '@/utils/common';

interface GroupBackend {
  id: any;
  nombre?: string;    
  facultad?: string[];
  activo?: boolean;
  email?: string;
  telefono?: string;
  imagen_url?: string;
}

interface GroupsTableProps {
  initialGroups: GroupBackend[];
  currentPage: number;
  totalPages: number;
  currentFaculty: string;
  currentSearch: string;
  currentActive: string;
  hideFacultyFilter?: boolean;
  basePath?: string;
  showFacultyColumn?: boolean;
}

export function GroupsTable({ 
  initialGroups, 
  currentPage, 
  totalPages,
  currentFaculty,
  currentSearch,
  currentActive,
  hideFacultyFilter = false,
  basePath = "/admin",
  showFacultyColumn = true,
}: GroupsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Estados locales para controlar los filtros
  const [selectedFaculty, setSelectedFaculty] = useState<string>(currentFaculty);
  const [selectedActive, setSelectedActive] = useState<string>(currentActive);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(Boolean(currentSearch));
  const [searchQuery, setSearchQuery] = useState<string>(currentSearch);

  const facultadesUCV = ['Todos', ...FACULTADES_FILTRO];

  // Helper para actualizar los parámetros en la URL
  const updateUrlParams = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Al cambiar cualquier filtro, reseteamos a la página 1
    params.set('page', '1');

    Object.entries(newParams).forEach(([key, value]) => {
      if (!value || value === 'Todos' || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleFacultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedFaculty(value);
    updateUrlParams({ faculty: value });
  };

  const handleActiveChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedActive(value);
    updateUrlParams({ active: value });
  };

  const handleSearchSubmit = () => {
    updateUrlParams({ q: searchQuery });
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearchOpen(false);
    updateUrlParams({ q: null });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const colSpanCount = showFacultyColumn ? 5 : 4;

  return (
    <Box w="full" maxW="100%" overflow="hidden">
      {/* Sección de Filtros y Búsqueda */}
      <Box mb={6} p={4} bg="gray.50" borderRadius="xl" borderWidth="1px" borderColor="gray.100">
        <Stack direction={{ base: "column", md: "row" }} spacing={4} align="center" justify="space-between">
          
          <Flex wrap="wrap" gap={4} flex={1} w="full">
            {/* Filtro por Facultad */}
            {!hideFacultyFilter && (
              <Box minW="220px">
                <Text mb={1} fontSize="sm" fontWeight="bold">Filtrar por Facultad (UCV):</Text>
                <Select 
                  bg="white" 
                  size="sm"
                  borderRadius="md"
                  value={selectedFaculty} 
                  onChange={handleFacultyChange}
                >
                  {facultadesUCV.map(fac => (
                    <option key={fac} value={fac}>{fac}</option>
                  ))}
                </Select>
              </Box>
            )}

            {/* Filtro por Estado */}
            <Box minW="180px">
              <Text mb={1} fontSize="sm" fontWeight="bold">ESTADO DE GRUPO</Text>
              <Select 
                bg="white" 
                size="sm"
                borderRadius="md"
                value={selectedActive} 
                onChange={handleActiveChange}
              >
                <option value="Todos">Todos los Estados</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos / Pendientes</option>
              </Select>
            </Box>
          </Flex>

          {/* Buscador interactivo por Nombre */}
          <Box flexShrink={0} alignSelf={{ base: "flex-end", md: "center" }}>
            {isSearchOpen ? (
              <InputGroup size="sm" maxW="300px">
                <Input
                  placeholder="Buscar grupo por nombre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  bg="white"
                  borderRadius="md"
                  autoFocus
                />
                <InputRightElement>
                  <IconButton
                    aria-label="Limpiar o cerrar búsqueda"
                    icon={<CloseIcon />}
                    size="xs"
                    variant="ghost"
                    onClick={handleClearSearch}
                  />
                </InputRightElement>
              </InputGroup>
            ) : (
              <IconButton
                aria-label="Buscar grupo por nombre"
                icon={<SearchIcon />}
                size="sm"
                colorScheme="teal"
                variant="outline"
                onClick={() => setIsSearchOpen(true)}
              />
            )}
          </Box>
        </Stack>
      </Box>

      {/* Tabla */}
      <Box 
        w="full" 
        maxW="100%" 
        border="1px solid" 
        borderColor="gray.100" 
        borderRadius="md" 
        bg="white"
      >
        <Table variant="simple" layout="fixed" w="full">
          <Thead bg="gray.50">
            <Tr>
              <Th w={showFacultyColumn ? "30%" : "40%"} px={3}>Grupo</Th>
              {showFacultyColumn && <Th w="25%" px={3}>Facultad</Th>}
              <Th w="23%" px={3}>Contacto</Th>
              <Th w="10%" px={2} textAlign="center">Estado</Th>
              <Th w="13%" px={2} textAlign="center">Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {initialGroups.length > 0 ? (
              initialGroups.map((grupo) => {
                const nombreGrupo = grupo.nombre || "Nombre no disponible";
                const facultadRaw = grupo.facultad || "Facultad no disponible";
                const listaFacultades = parseFacultiesList(facultadRaw);
                const estaActivo = grupo.activo;
                const grupoId = grupo.id;

                // Mapeo exhaustivo para logo/imagen
                const logoSrc = grupo.imagen_url || "/imagen-no-disponible.jpg";
                
                // Mapeo exhaustivo de contacto
                const emailContacto = grupo.email || "Sin correo";
                const telefonoContacto = grupo.telefono || "Sin teléfono";

                const detailUrl = `${basePath}/grupo/${grupoId}`;

                return (
                  <Tr key={grupoId} _hover={{ bg: "gray.50" }}>
                    
                    {/* Logo + Nombre */}
                    <Td>
                      <HStack spacing={3} align="center">
                        <Image
                          src={logoSrc}
                          alt={nombreGrupo}
                          boxSize="48px"
                          flexShrink={0}
                          objectFit="cover"
                          borderRadius="md"
                          fallbackSrc="/imagen-no-disponible.jpg"
                        />
                        <Text
                          fontWeight="bold" 
                          color="teal.600" 
                          cursor="pointer"
                          lineHeight="short"
                          _hover={{ textDecoration: "underline" }}
                          onClick={() => router.push(detailUrl)}
                        >
                          {nombreGrupo}
                        </Text>
                      </HStack>
                    </Td>
                    
                    {/* Facultad(es) */}
                    {showFacultyColumn && (
                      <Td px={3} py={3} whiteSpace="normal">
                        {listaFacultades.length > 0 ? (
                          <Wrap spacing={1}>
                            {listaFacultades.map((fac, idx) => (
                              <WrapItem key={idx}>
                                <Badge colorScheme="secondary" variant="subtle" px={1.5} py={0.5} borderRadius="sm" fontSize="xs">
                                  {fac}
                                </Badge>
                              </WrapItem>
                            ))}
                          </Wrap>
                        ) : (
                          <Text fontSize="xs" color="gray.400">Sin facultad asignada</Text>
                        )}
                      </Td>
                    )}

                    {/* Contacto */}
                    <Td px={3} py={3} whiteSpace="normal" wordBreak="break-all">
                      <Text fontSize="sm" fontWeight="medium" color="gray.800" lineHeight="tight">{emailContacto}</Text>
                      <Text fontSize="xs" color="gray.500" mt={1}>{telefonoContacto}</Text>
                    </Td>
                    
                    {/* Estado */}
                    <Td px={2} py={3} textAlign="center" whiteSpace="normal">
                      <Badge colorScheme={estaActivo ? "green" : "red"} variant="solid" borderRadius="full" px={2}>
                        {estaActivo ? "Activo" : "Inactivo"}
                      </Badge>
                    </Td>

                    {/* Acciones */}
                    <Td px={2} py={3} textAlign="center">
                      <Button
                        size="sm"
                        colorScheme="teal"
                        variant="outline"
                        onClick={() => router.push(detailUrl)}
                      >
                        Ver Detalles
                      </Button>
                    </Td>
                  </Tr>
                );
              })
            ) : (
              <Tr>
                <Td colSpan={colSpanCount} textAlign="center" py={12}>
                  <Text color="gray.500" fontSize="md">
                    No se encontraron grupos registrados para los criterios seleccionados.
                  </Text>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Paginación */}
      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        basePath={basePath === "/admin" ? "/admin/grupos" : basePath+"/grupos"}
        queryParams={{
          ...(!hideFacultyFilter && selectedFaculty !== 'Todos' && { faculty: selectedFaculty }),
          ...(selectedActive !== 'Todos' && { active: selectedActive }),
          ...(currentSearch && { q: currentSearch }),
        }}
      />
    </Box>
  );
}