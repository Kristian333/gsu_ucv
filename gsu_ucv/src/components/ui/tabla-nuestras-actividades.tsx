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
} from "@chakra-ui/react";
import { FiEdit } from "react-icons/fi";
import { FaRegFileAlt } from "react-icons/fa";

interface Actividad {
  id: number;
  title: string;
  place?: string;
  date_start: string;
  date_end: string;
  group?: string;
}

export default function TablaNuestrasActividades({
  actividades,
}: {
  actividades: Actividad[];
}) {
  /**
   * Utilidades para corregir fechas
   * --------------------------------
   */

  function parseLocalDate(dateStr?: string | null): Date | null {
    if (!dateStr) return null;
    const parts = dateStr.split("-");
    if (parts.length < 3) return null;

    return new Date(
      Number(parts[0]),
      Number(parts[1]) - 1,
      Number(parts[2])
    );
  }

  function normalizeToMidnight(d?: Date | null) {
    if (!d) return null;
    const nd = new Date(d);
    nd.setHours(0, 0, 0, 0);
    return nd;
  }

  const today = normalizeToMidnight(new Date())!;

  // Filtrar SOLO actividades de LAMUN
  const actividadesLAMUN = actividades
    .map((a) => {
      const start = parseLocalDate(a.date_start);
      const end = parseLocalDate(a.date_end);

      return {
        ...a,
        _start: normalizeToMidnight(start),
        _end: normalizeToMidnight(end),
      };
    })
    .filter((a) => a.group?.trim().toLowerCase() === "lamun");

  const format = (d?: Date | null) =>
    d ? d.toLocaleDateString("es-ES") : "-";

  return (
    <Box bg="white" p={6} rounded="md" shadow="sm">
      <Table variant="simple">
        <Thead bg="gray.50">
          <Tr>
            <Th>Nombre</Th>
            <Th>Lugar</Th>
            <Th>Fecha Inicio</Th>
            <Th>Fecha Fin</Th>
            <Th isNumeric>Acción</Th>
          </Tr>
        </Thead>

        <Tbody>
          {actividadesLAMUN.map((act) => {
            const start = act._start;
            const end = act._end;

            const isFuture = !!start && start.getTime() > today.getTime();
            const isPast = !!end && end.getTime() < today.getTime();

            return (
              <Tr key={act.id}>
                {/* NOMBRE → link a actividad/{id} */}
                <Td>
                  <Link
                    as={NextLink}
                    href={`/actividad/${act.id}`}
                    color="teal.600"
                    fontWeight="bold"
                    _hover={{ textDecoration: "underline", color: "teal.800" }}
                  >
                    {act.title}
                  </Link>
                </Td>

                <Td>{act.place ?? "-"}</Td>
                <Td>{format(start)}</Td>
                <Td>{format(end)}</Td>

                <Td isNumeric>
                  {isFuture && (
                    <Tooltip label="Editar actividad">
                      <IconButton
                        as={NextLink}
                        href={`/admingroup/modificar_actividad/${act.id}`}
                        aria-label="Editar"
                        icon={<FiEdit />}
                        size="sm"
                        variant="ghost"
                      />
                    </Tooltip>
                  )}

                  {isPast && (
                    <Tooltip label="Ver reporte / editar">
                      <IconButton
                        as={NextLink}
                        href={`/admingroup/reporte/${act.id}`}
                        aria-label="Reporte"
                        icon={<FaRegFileAlt />}
                        size="sm"
                        variant="ghost"
                      />
                    </Tooltip>
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
