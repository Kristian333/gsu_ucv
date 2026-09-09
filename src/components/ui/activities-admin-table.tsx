// /components/ui/activities-admin-table.tsx
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
import { formatDateToClient, getActivityStatus } from '@/utils/common'

interface ActivitiesReportsTableProps {
  activities: ActivityBackend[]
  currentReportCheckedFilter?: string
  currentStatusFilter?: string
  currentPage: number
  totalPages: number
  mode?: 'reports' | 'group_activities'
}

export function ActivitiesReportsTable({
  activities,
  currentReportCheckedFilter = '',
  currentStatusFilter = '',
  currentPage,
  totalPages,
  mode = 'reports',
}: ActivitiesReportsTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)
  }

  const queryParamsForPagination: Record<string, string> = {}
  if (currentReportCheckedFilter) {
    queryParamsForPagination.report_checked = currentReportCheckedFilter
  }
  if (currentStatusFilter) {
    queryParamsForPagination.status = currentStatusFilter
  }

  return (
    <Box>
      {/* Filtros */}
      <Box mb={6} p={4} bg="gray.50" borderRadius="xl" borderWidth="1px" borderColor="gray.100">
        <Stack direction={{ base: 'column', md: 'row' }} spacing={4} align="center" justify="space-between">
          <Flex wrap="wrap" gap={4} flex={1} w="full">
            {mode === 'reports' ? (
              <Box minW="200px">
                <Text mb={1} fontSize="sm" fontWeight="bold">
                  Estado de Revisión:
                </Text>
                <Select
                  bg="white"
                  size="sm"
                  borderRadius="md"
                  value={currentReportCheckedFilter}
                  onChange={(e) => handleFilterChange('report_checked', e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="false">Pendientes</option>
                  <option value="true">Revisados</option>
                </Select>
              </Box>
            ) : (
              <Box minW="220px">
                <Text mb={1} fontSize="sm" fontWeight="bold">
                  Estado de la Actividad:
                </Text>
                <Select
                  bg="white"
                  size="sm"
                  borderRadius="md"
                  value={currentStatusFilter}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">Todos los Estados</option>
                  <option value="future">Actividad Futura</option>
                  <option value="in_progress">Actividad En Curso</option>
                  <option value="pending_report">A la Espera de Reporte</option>
                  <option value="pending_review">Reporte Pendiente de Revisión</option>
                  <option value="reviewed">Reporte Revisado</option>
                </Select>
              </Box>
            )}
          </Flex>
        </Stack>
      </Box>

      {/* Tabla */}
      <TableContainer minH="300px" border="1px solid" borderColor="gray.100" borderRadius="md">
        <Table variant="simple" size="sm">
          <Thead bg="gray.50">
            <Tr>
              <Th maxW="180px">Nombre de la Actividad</Th>
              {mode === 'reports' && <Th maxW="160px">Grupo</Th>}
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
                <Td colSpan={mode === 'reports' ? 7 : 6} textAlign="center" py={12}>
                  <Text color="gray.500" fontSize="md">
                    No se encontraron actividades para los criterios seleccionados.
                  </Text>
                </Td>
              </Tr>
            ) : (
              activities.map((act) => {
                const statusInfo = getActivityStatus(act)
                const startFormatted = formatDateToClient(act.fecha_inicio)
                const endFormatted = formatDateToClient(act.fecha_fin)
                const isSameDate = !endFormatted || startFormatted === endFormatted

                return (
                  <Tr
                    key={act.id}
                    _hover={{ bg: 'gray.50' }}
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
                    {mode === 'reports' && (
                      <Td maxW="160px">
                        <Text isTruncated title={act.nombre_grupo || 'N/A'} color="teal.700" fontWeight="medium">
                          {act.nombre_grupo || 'N/A'}
                        </Text>
                      </Td>
                    )}

                    {/* Fecha */}
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

                    {/* Números */}
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
                        variant="subtle"
                        colorScheme={statusInfo.colorScheme}
                        px={3}
                        py={1}
                        borderRadius="full"
                        fontSize="xs"
                        textTransform="capitalize"
                      >
                        {statusInfo.label}
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