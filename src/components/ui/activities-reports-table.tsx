'use client'

import React from 'react'
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Select,
  Box,
  Flex,
  Text,
  TableContainer,
  Stack,
} from '@chakra-ui/react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ActivityBackend } from '@/types/activity'
import { Pagination } from '@/components/ui/pagination'
import { formatDateToClient } from '@/utils/common'

interface ActivitiesReportsTableProps {
  activities: ActivityBackend[]
  currentReportCheckedFilter?: string
  currentPage: number
  totalPages: number
}

export function ActivitiesReportsTable({
  activities,
  currentReportCheckedFilter = '',
  currentPage,
  totalPages,
}: ActivitiesReportsTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set('report_checked', value)
    } else {
      params.delete('report_checked')
    }

    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)
  }

  const queryParamsForPagination: Record<string, string> = {}
  if (currentReportCheckedFilter) {
    queryParamsForPagination.report_checked = currentReportCheckedFilter
  }

  return (
    <Box>
      {/* Filtros */}
      <Box mb={6} p={4} bg="gray.50" borderRadius="xl" borderWidth="1px" borderColor="gray.100">
        <Stack direction={{ base: 'column', md: 'row' }} spacing={4} align="center" justify="space-between">
          <Flex wrap="wrap" gap={4} flex={1} w="full">
            <Box minW="200px">
              <Text mb={1} fontSize="sm" fontWeight="bold">
                Estado de Revisión:
              </Text>
              <Select
                bg="white"
                size="sm"
                borderRadius="md"
                value={currentReportCheckedFilter}
                onChange={handleFilterChange}
              >
                <option value="">Todos</option>
                <option value="false">Pendientes</option>
                <option value="true">Revisados</option>
              </Select>
            </Box>
          </Flex>
        </Stack>
      </Box>

      {/* Tabla */}
      <TableContainer minH="300px" border="1px solid" borderColor="gray.100" borderRadius="md">
        <Table variant="simple" size="sm">
          <Thead bg="gray.50">
            <Tr>
              <Th maxW="180px">Nombre de la Actividad</Th>
              <Th maxW="160px">Grupo</Th>
              <Th w="120px">Fecha</Th>
              <Th isNumeric w="90px" whiteSpace="normal" textAlign="right">Miembros Part.</Th>
              <Th isNumeric w="100px" whiteSpace="normal" textAlign="right">Benef. Estimados</Th>
              <Th isNumeric w="100px" whiteSpace="normal" textAlign="right">Benef. Reales</Th>
              <Th textAlign="center" w="130px">Estado</Th>
            </Tr>
          </Thead>
          <Tbody>
            {activities.length === 0 ? (
              <Tr>
                <Td colSpan={7} textAlign="center" py={12}>
                  <Text color="gray.500" fontSize="md">
                    No se encontraron actividades con reporte para los criterios seleccionados.
                  </Text>
                </Td>
              </Tr>
            ) : (
              activities.map((act) => {
                const isChecked = act.reporte_revisado
                
                // Formateo de Fecha
                const startFormatted = formatDateToClient(act.fecha_inicio)
                const endFormatted = formatDateToClient(act.fecha_fin)
                const isSameDate = !endFormatted || startFormatted === endFormatted

                return (
                  <Tr
                    key={act.id}
                    bg={isChecked ? 'green.50' : 'yellow.50'}
                    _hover={{ bg: isChecked ? 'green.100' : 'yellow.100' }}
                    transition="background-color 0.2s"
                    cursor="pointer"
                    onClick={() => router.push(`/admin/actividad/${act.id}`)}
                  >
                    {/* Actividad */}
                    <Td maxW="180px">
                      <Text isTruncated title={act.nombre} fontWeight="bold" color="gray.800">
                        {act.nombre}
                      </Text>
                    </Td>

                    {/* Grupo */}
                    <Td maxW="160px">
                      <Text isTruncated title={act.nombre_grupo || 'N/A'} color="teal.700" fontWeight="medium">
                        {act.nombre_grupo || 'N/A'}
                      </Text>
                    </Td>

                    {/* Fecha (Rango en 2 líneas) */}
                    <Td w="120px" fontSize="xs" color="gray.700" whiteSpace="nowrap">
                      {isSameDate ? (
                        <Text fontWeight="medium">{startFormatted}</Text>
                      ) : (
                        <Box lineHeight="tight">
                          <Text fontWeight="medium">{startFormatted}</Text>
                          <Text fontSize="9px" color="gray.500" textTransform="uppercase" my="-2px">
                            al
                          </Text>
                          <Text fontWeight="medium">{endFormatted}</Text>
                        </Box>
                      )}
                    </Td>

                    {/* Números con anchos controlados */}
                    <Td isNumeric w="90px" fontWeight="medium">
                      {act.participantes_grupo ?? 0}
                    </Td>
                    <Td isNumeric w="100px" color="gray.600">
                      {act.participantes_estimados ?? 0}
                    </Td>
                    <Td isNumeric w="100px" fontWeight="bold" color="teal.800">
                      {act.participantes_reales ?? 0}
                    </Td>

                    {/* Estado */}
                    <Td textAlign="center" w="130px">
                      <Badge
                        variant="solid"
                        colorScheme={isChecked ? 'green' : 'yellow'}
                        px={3}
                        py={1}
                        borderRadius="full"
                        fontSize="xs"
                        textTransform="capitalize"
                      >
                        {isChecked ? 'Revisado' : 'Pendiente'}
                      </Badge>
                    </Td>
                  </Tr>
                )
              })
            )}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Paginado */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={pathname}
        queryParams={queryParamsForPagination}
      />
    </Box>
  )
}