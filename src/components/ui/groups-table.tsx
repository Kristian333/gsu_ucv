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
} from '@chakra-ui/react';
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
  phone?: string;
  image?: string;
  logo_url?: string;
  logo?: string;
}

interface GroupsTableProps {
  initialGroups: GroupBackend[];
  currentPage: number;
  perPage: number;
}

export function GroupsTable({ initialGroups, currentPage, perPage }: GroupsTableProps) {
  const router = useRouter();
  const [selectedFaculty, setSelectedFaculty] = useState<string>('Todos');

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
    'Ciencias Veterinarias'
  ];

  const filteredGroups = useMemo(() => {
    return initialGroups.filter(g => {
      if (selectedFaculty === 'Todos') return true;
      const facultadReal = g.facultad || g.faculty || '';
      return facultadReal.toLowerCase().trim() === selectedFaculty.toLowerCase().trim();
    });
  }, [initialGroups, selectedFaculty]);

  const totalPagesVirtual = useMemo(() => {
    if (initialGroups.length < perPage) {
      return currentPage;
    }
    return currentPage + 1;
  }, [initialGroups, currentPage, perPage]);

  return (
    <Box>
      {/* Filtros por Facultad */}
      <Box mb={6} p={4} bg="gray.50" borderRadius="md">
        <Text mb={2} fontWeight="bold" color="gray.700">Filtrar por Facultad (UCV):</Text>
        <Select 
          maxW="400px" 
          bg="white" 
          value={selectedFaculty} 
          onChange={(e) => setSelectedFaculty(e.target.value)}
        >
          {facultadesUCV.map(fac => (
            <option key={fac} value={fac}>{fac}</option>
          ))}
        </Select>
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
            {filteredGroups.length > 0 ? (
              filteredGroups.map((grupo, index) => {
                const nombreGrupo = grupo.nombre || grupo.name || "Sin nombre asignado";
                const facultadGrupo = grupo.facultad || grupo.faculty || "No asignada";
                const estaActivo = grupo.activo !== undefined ? grupo.activo : true;
                const grupoId = grupo.id || index;
                const logoSrc = grupo.image || grupo.logo_url || grupo.logo || "/placeholder-logo.png";

                return (
                  <Tr key={grupoId} _hover={{ bg: "gray.50" }}>
                    
                    {/* Celda con Logo + Nombre clickable */}
                    <Td>
                      <HStack spacing={3}>
                        <Image
                          src={logoSrc}
                          alt={nombreGrupo}
                          boxSize="50px"
                          objectFit="cover"
                          borderRadius="md"
                          fallbackSrc="https://placehold.co/50x50?text=Grupo"
                        />
                        <Text
                          fontWeight="bold" 
                          color="teal.600" 
                          cursor="pointer"
                          _hover={{ textDecoration: "underline" }}
                          onClick={() => router.push(`/admin/usuarios/${grupoId}`)}
                        >
                          {nombreGrupo}
                        </Text>
                      </HStack>
                    </Td>
                    
                    <Td>
                      <Badge colorScheme="purple" variant="subtle">
                        {facultadGrupo}
                      </Badge>
                    </Td>

                    {/* Contacto */}
                    <Td>
                      <Text fontSize="sm">{grupo.email || "Sin correo"}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {grupo.phone || "Sin teléfono"}
                      </Text>
                    </Td>
                    
                    <Td>
                      <Badge colorScheme={estaActivo ? "green" : "orange"}>
                        {estaActivo ? "Activo" : "Pendiente / Inactivo"}
                      </Badge>
                    </Td>

                    <Td textAlign="center">
                      <Button
                        size="sm"
                        colorScheme="teal"
                        variant="outline"
                        onClick={() => router.push(`/admin/usuarios/${grupoId}`)}
                      >
                        Ver Detalles
                      </Button>
                    </Td>
                  </Tr>
                );
              })
            ) : (
              <Tr>
                <Td colSpan={5} textAlign="center" py={10}>
                  <Text color="gray.500">No se encontraron grupos registrados para los criterios seleccionados.</Text>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Paginación */}
      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPagesVirtual} 
        basePath="/admin/grupos"
      />
    </Box>
  );
}