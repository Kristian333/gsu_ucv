"use client";

import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Box,
  Text,
  Badge,
  RadioGroup,
  Stack,
  Radio,
  Link as ChakraLink,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import React, { useState, useMemo } from 'react';

interface Solicitud {
  id: string;
  tipo: string;
  fecha: string;
  estado: string;
  nombre: string;
}

interface SolicitudesTableProps {
  educacionContinua: Solicitud[];
  grupoExtension: Solicitud[];
}

const tipoColorMap: { [key: string]: string } = {
  'Código de Proveedor': 'blue',
  'Formulación de Curso - Directa': 'purple',
  'Formulación de Curso - Indirecta': 'pink',
  'Actualización de Curso': 'red',
  'Solicitud de Evento': 'green',
  'Solicitud de Recurso': 'orange',
};

const getBadgeColorScheme = (estado: string) => {
  switch (estado.toLowerCase()) {
    case 'pendiente':
      return 'orange';
    case 'aprobada':
      return 'green';
    case 'rechazada':
      return 'red';
    default:
      return 'gray';
  }
};

export function SolicitudesTable({ educacionContinua, grupoExtension }: SolicitudesTableProps) {
  const [filter, setFilter] = useState('Todos');

  const educacionContinuaTypes = useMemo(() => ['Todos', ...new Set(educacionContinua.map(sol => sol.tipo))], [educacionContinua]);
  const grupoExtensionTypes = useMemo(() => ['Todos', ...new Set(grupoExtension.map(sol => sol.tipo))], [grupoExtension]);

  const renderTable = (solicitudes: Solicitud[]) => {
    const filteredSolicitudes = filter === 'Todos'
      ? solicitudes
      : solicitudes.filter(sol => sol.tipo === filter);

    return (
      <TableContainer minH="500px">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Tipo</Th>
              <Th>Nombre</Th>
              <Th>Fecha</Th>
              <Th>Estado</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredSolicitudes.length > 0 ? (
              filteredSolicitudes.map((sol) => (
                <NextLink key={sol.id} href={`/admin/solicitudes/${sol.id}`} passHref legacyBehavior>
                  <ChakraLink
                    as="tr"
                    // CAMBIO: Usamos gray.100, que es sensible al tema y se adapta automáticamente.
                    // En modo claro será un gris claro, en modo oscuro será un blanco semitransparente.
                    _hover={{ bg: 'rowhover', cursor: 'pointer' }} 
                    style={{ display: 'table-row' }}
                  >
                    <Td>{sol.id}</Td>
                    <Td>
                      <Badge colorScheme={tipoColorMap[sol.tipo] || 'gray'}>{sol.tipo}</Badge>
                    </Td>
                    <Td>{sol.nombre}</Td>
                    <Td>{sol.fecha}</Td>
                    <Td>
                      <Badge colorScheme={getBadgeColorScheme(sol.estado)}>{sol.estado}</Badge>
                    </Td>
                  </ChakraLink>
                </NextLink>
              ))
            ) : (
              <Tr>
                <Td colSpan={5} textAlign="center" py={10}>
                  <Text>No hay solicitudes de este tipo.</Text>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>
    );
  };

  const renderFilters = (types: string[]) => (
    <RadioGroup onChange={setFilter} value={filter}>
      <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
        {types.map(tipo => (
          <Radio key={tipo} value={tipo}>
            {tipo}
          </Radio>
        ))}
      </Stack>
    </RadioGroup>
  );

  return (
    <Tabs variant="enclosed">
      <TabList>
        <Tab>Educación Continua ({educacionContinua.length})</Tab>
        <Tab>Grupo de Extensión ({grupoExtension.length})</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <Box mb={6}>
            <Text mb={2} fontWeight="bold">Filtrar por tipo de solicitud:</Text>
            {renderFilters(educacionContinuaTypes)}
          </Box>
          {renderTable(educacionContinua)}
        </TabPanel>
        <TabPanel>
          <Box mb={6}>
            <Text mb={2} fontWeight="bold">Filtrar por tipo de solicitud:</Text>
            {renderFilters(grupoExtensionTypes)}
          </Box>
          {renderTable(grupoExtension)}
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}