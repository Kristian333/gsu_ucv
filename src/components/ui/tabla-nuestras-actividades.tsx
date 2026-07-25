"use client";

import React from "react";
import NextLink from "next/link";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Tooltip,
  Link,
  Text,
} from "@chakra-ui/react";
import { FiEdit } from "react-icons/fi";
import { FaRegFileAlt } from "react-icons/fa";

interface Actividad {
  id: number | string;
  title?: string;
  nombre?: string; 
  place?: string;
  location?: string; 
  date_start?: string;
  fecha?: string; 
  group?: string;
}

interface TablaProps {
  actividades: Actividad[];
  permitirEditar?: boolean; 
}

export default function TablaNuestrasActividades({
  actividades,
  permitirEditar = false,
}: TablaProps) {
  
  function parseLocalDate(dateStr?: string | null): Date | null {
    if (!dateStr) return null;
    
    if (dateStr.includes("-")) {
      return new Date(dateStr.substring(0, 10) + "T00:00:00");
    }

    const parts = dateStr.split("/");
    if (parts.length < 3) return null;

    return new Date(
      Number(parts[2]),
      Number(parts[1]) - 1,
      Number(parts[0]),
    );
  }

  function normalizeToMidnight(d?: Date | null) {
    if (!d) return null;
    const nd = new Date(d);
    nd.setHours(0, 0, 0, 0);
    return nd;
  }

  const today = normalizeToMidnight(new Date())!;

  const listaProcesada = actividades.map((a) => {
    const fechaString = a.fecha || a.date_start;
    const start = parseLocalDate(fechaString);

    return {
      ...a,
      _start: normalizeToMidnight(start),
    };
  });

  const format = (d?: Date | null) =>
    d ? d.toLocaleDateString("es-ES") : "/";

  return (
    <Box bg="white" p={6} rounded="md" shadow="sm" overflowX="auto">
      <Table variant="simple">
        <Thead bg="gray.50">
          <Tr>
            <Th>Nombre</Th>
            <Th>Lugar</Th>
            <Th>Fecha</Th>
            <Th isNumeric>Acción</Th>
          </Tr>
        </Thead>

        <Tbody>
          {listaProcesada.map((act) => {
            const start = act._start;

            // Al haber una sola fecha, la comparación de "pasado" se hace con el inicio
            const isPast = !!start && start.getTime() < today.getTime();

            const nombreActividad = act.nombre || act.title || "Actividad sin título";
            const lugarActividad = act.location || act.place || "-";

            return (
              <Tr key={act.id}>
                <Td>
                  <Link
                    as={NextLink}
                    href={`/actividad/${act.id}`}
                    color="teal.600"
                    fontWeight="bold"
                    _hover={{ textDecoration: "underline", color: "teal.800" }}
                  >
                    {nombreActividad}
                  </Link>
                </Td>

                <Td>{lugarActividad}</Td>
                <Td>{format(start)}</Td>

                <Td isNumeric>
                  {permitirEditar && (
                    <Tooltip label="Editar actividad">
                      <IconButton
                        as={NextLink}
                        href={`/admingroup/modificar_actividad/${act.id}`} 
                        aria-label="Editar"
                        icon={<FiEdit />}
                        size="sm"
                        variant="ghost"
                        colorScheme="teal"
                      />
                    </Tooltip>
                  )}

                  {isPast && (
                    <Tooltip label="Hacer reporte">
                      <IconButton
                        as={NextLink}
                        href={`/admingroup/reporte/${act.id}`}
                        aria-label="Reporte"
                        icon={<FaRegFileAlt />}
                        size="sm"
                        variant="ghost"
                        colorScheme="orange"
                        ml={2}
                      />
                    </Tooltip>
                  )}

                  {!permitirEditar && !isPast && (
                    <Text fontSize="xs" color="gray.400" fontStyle="italic">Sin acciones</Text>
                  )}
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Box>
  );
}
