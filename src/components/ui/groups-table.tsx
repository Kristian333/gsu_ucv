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
} from '@chakra-ui/react';
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { SearchIcon, CloseIcon } from '@chakra-ui/icons';
import { Pagination } from "@/components/ui/pagination";

interface GroupBackend {
  id: any;
  nombre?: string;
  name?: string;       
  facultad?: string;
  faculty?: string;    
  activo?: boolean;
  is_active?: boolean;
  email?: string;
  telefono?: string;
  phone?: string;
  imagen_url?: string;
}

interface GroupsTableProps {
  initialGroups: GroupBackend[];
  currentPage: number;
  totalPages: number;
  currentFaculty: string;
  currentSearch: string;
  currentActive: string;
}

export function GroupsTable({ 
  initialGroups, 
  currentPage, 
  totalPages,
  currentFaculty,
  currentSearch,
  currentActive,
}: GroupsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Estados locales para controlar los filtros
  const [selectedFaculty, setSelectedFaculty] = useState<string>(currentFaculty);
  const [selectedActive, setSelectedActive] = useState<string>(currentActive);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(Boolean(currentSearch));
  const [searchQuery, setSearchQuery] = useState<string>(currentSearch);

  const facultadesUCV = [
    'Todos',
    'Ciencias',
    'Ingeniería',
    'Humanidades y Educación',
    'Medicina',
    'Odontología',
    'Farmacia',
    'Arquitectura y Urbanismo',
    'Ciencias Económicas y Sociales',
    'Ciencias Jurídicas y Políticas',
    'Agronomía',
    'Ciencias Veterinarias',
    'DEU'
  ];

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

  return (
    <Box>
      {/* Sección de Filtros y Búsqueda */}
      <Box mb={6} p={4} bg="gray.50" borderRadius="xl" borderWidth="1px" borderColor="gray.100">
        <Stack direction={{ base: "column", md: "row" }} spacing={4} align="center" justify="space-between">
          
          <Flex wrap="wrap" gap={4} flex={1} w="full">
            {/* Filtro por Facultad */}
            <Box minW="220px">
              <Text mb={1} fontSize="xs" fontWeight="bold" color="gray.700">Filtrar por Facultad (UCV):</Text>
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

            {/* Filtro por Estado */}
            <Box minW="180px">
              <Text mb={1} fontSize="xs" fontWeight="bold" color="gray.600">ESTADO DE GRUPO</Text>
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
      <TableContainer minH="300px" border="1px solid" borderColor="gray.100" borderRadius="md">
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>Grupo</Th>
              <Th>Facultad</Th>
              <Th>Contacto</Th>
              <Th>Estado</Th>
              <Th textAlign="center">Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {initialGroups.length > 0 ? (
              initialGroups.map((grupo, index) => {
                const nombreGrupo = grupo.nombre || "Nombre no disponible";
                const facultadGrupo = grupo.facultad || "Facultad no disponible";
                const estaActivo = grupo.activo !== undefined ? grupo.activo : (grupo.is_active !== undefined ? grupo.is_active : true);
                const grupoId = grupo.id;

                // Mapeo exhaustivo para logo/imagen
                const logoSrc = grupo.imagen_url || "/imagen-no-disponible.jpg";
                
                // Mapeo exhaustivo de contacto
                const emailContacto = grupo.email || "Sin correo";
                const telefonoContacto = grupo.telefono || "Sin teléfono";

                return (
                  <Tr key={grupoId} _hover={{ bg: "gray.50" }}>
                    
                    {/* Logo + Nombre */}
                    <Td>
                      <HStack spacing={3}>
                        <Image
                          src={logoSrc}
                          alt={nombreGrupo}
                          boxSize="48px"
                          objectFit="cover"
                          borderRadius="md"
                          fallbackSrc="/imagen-no-disponible.jpg"
                        />
                        <Text
                          fontWeight="bold" 
                          color="teal.600" 
                          cursor="pointer"
                          _hover={{ textDecoration: "underline" }}
                          onClick={() => router.push(`/admin/grupo/${grupoId}`)}
                        >
                          {nombreGrupo}
                        </Text>
                      </HStack>
                    </Td>
                    
                    {/* Facultad */}
                    <Td>
                      <Badge colorScheme="secondary" variant="subtle" px={2} py={1} borderRadius="sm">
                        {facultadGrupo}
                      </Badge>
                    </Td>

                    {/* Contacto */}
                    <Td>
                      <Text fontSize="sm" fontWeight="medium" color="gray.800">{emailContacto}</Text>
                      <Text fontSize="xs" color="gray.500">{telefonoContacto}</Text>
                    </Td>
                    
                    {/* Estado */}
                    <Td>
                      <Badge colorScheme={estaActivo ? "green" : "red"} variant="solid" borderRadius="full" px={2}>
                        {estaActivo ? "Activo" : "Pendiente / Inactivo"}
                      </Badge>
                    </Td>

                    {/* Acciones */}
                    <Td textAlign="center">
                      <Button
                        size="sm"
                        colorScheme="teal"
                        variant="outline"
                        onClick={() => router.push(`/admin/grupo/${grupoId}`)}
                      >
                        Ver Detalles
                      </Button>
                    </Td>
                  </Tr>
                );
              })
            ) : (
              <Tr>
                <Td colSpan={5} textAlign="center" py={12}>
                  <Text color="gray.500" fontSize="md">No se encontraron grupos registrados para los criterios seleccionados.</Text>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Paginación */}
      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        basePath="/admin/grupos"
        queryParams={{
          ...(selectedFaculty !== 'Todos' && { faculty: selectedFaculty }),
          ...(selectedActive !== 'Todos' && { active: selectedActive }),
          ...(currentSearch && { q: currentSearch }),
        }}
      />
    </Box>
  );
}