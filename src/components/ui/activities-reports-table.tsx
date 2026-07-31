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
} from '@chakra-ui/react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ActivityBackend } from '@/types/activity'
import { Pagination } from '@/components/ui/pagination'

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
    <Box w="full" bg="white" p={6} borderRadius="lg" boxShadow="sm">
      {/* Filtros */}
      <Flex mb={6} justify="space-between" align="center" direction={{ base: 'column', md: 'row' }} gap={4}>
        <Text fontSize="lg" fontWeight="bold">
          Reportes Registrados
        </Text>
        <Flex align="center" gap={3} w={{ base: 'full', md: 'auto' }}>
          <Text fontSize="sm" color="gray.600" whiteSpace="nowrap">
            Estado de Revisión:
          </Text>
          <Select
            maxW="200px"
            value={currentReportCheckedFilter}
            onChange={handleFilterChange}
            size="sm"
            borderRadius="md"
          >
            <option value="">Todos</option>
            <option value="false">Pendientes</option>
            <option value="true">Revisados</option>
          </Select>
        </Flex>
      </Flex>

      {/* Tabla */}
      <TableContainer>
        <Table variant="simple" size="md">
          <Thead bg="gray.50">
            <Tr>
              <Th maxW="250px">Nombre de la Actividad</Th>
              <Th>Grupo</Th>
              <Th isNumeric>Miembros Participantes</Th>
              <Th isNumeric>Beneficiados Estimados</Th>
              <Th isNumeric>Beneficiados Reales</Th>
              <Th textAlign="center">Estado del Reporte</Th>
            </Tr>
          </Thead>
          <Tbody>
            {activities.length === 0 ? (
              <Tr>
                <Td colSpan={6} textAlign="center" py={8} color="gray.500">
                  No se encontraron actividades con reporte para los filtros seleccionados.
                </Td>
              </Tr>
            ) : (
              activities.map((act) => (
                <Tr key={act.id}>
                  {/* Columna Nombre con overflow oculto (Truncate/Ellipsis) */}
                  <Td maxW="250px">
                    <Text isTruncated title={act.nombre} fontWeight="medium">
                      {act.nombre}
                    </Text>
                  </Td>
                  <Td>{act.nombre_grupo || 'N/A'}</Td>
                  <Td isNumeric>{act.participantes_grupo}</Td>
                  <Td isNumeric>{act.participantes_estimados}</Td>
                  <Td isNumeric>{act.participantes_reales}</Td>
                  <Td textAlign="center">
                    <Badge
                      variant="outline"
                      colorScheme={act.reporte_revisado ? 'success' : 'warning'}
                      px={3}
                      py={1}
                      borderRadius="full"
                      textTransform="capitalize"
                    >
                      {act.reporte_revisado ? 'Revisado' : 'Pendiente'}
                    </Badge>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Paginador reutilizable */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={pathname}
        queryParams={queryParamsForPagination}
      />
    </Box>
  )
}