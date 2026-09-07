// /app/admin/reportes/page.tsx
import { Box, Heading, Text } from '@chakra-ui/react'
import { Metadata } from 'next'
import { ActivitiesReportsTable } from '@/components/ui/activities-reports-table'
import { ActivityBackend, GetActivitiesBackendResponse } from '@/types/activity'
import { apiServerRequest } from '@/utils/apiServer'

interface PageProps {
  searchParams: Promise<{
    report_checked?: string
    page?: string
  }>
}

interface FetchReportsResult {
  activities: ActivityBackend[]
  totalPages: number
  currentPage: number
}

async function getActivitiesReports(
  reportChecked?: string,
  page: number = 1
): Promise<FetchReportsResult> {
  const queryParams = new URLSearchParams({
    has_actual_participants: 'true',
    order: 'desc',
    page: String(page),
    limit: '10',
  })

  if (reportChecked === 'true' || reportChecked === 'false') {
    queryParams.append('report_checked', reportChecked)
  }

  try {
    const data: GetActivitiesBackendResponse = await apiServerRequest(
      `activities?${queryParams.toString()}`,
      { cache: 'no-store' }
    )

    return {
      activities: data.actividades || [],
      totalPages: data.pagina?.total_paginas || 1,
      currentPage: data.pagina?.pagina_actual || page,
    }
  } catch (error) {
    console.error('Failed to fetch activities reports:', error)
    return { activities: [], totalPages: 1, currentPage: 1 }
  }
}

export const metadata: Metadata = {
  title: 'Reportes de Actividades | GSU',
  description: 'Administra y revisa los reportes de actividades registradas.',
}

export default async function ReportsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams
  const reportCheckedFilter = resolvedSearchParams.report_checked
  const currentPage = Number(resolvedSearchParams.page) || 1

  const { activities, totalPages } = await getActivitiesReports(
    reportCheckedFilter,
    currentPage
  )

  return (
    <Box maxW="container.xl" mx="auto" py={10} px={6}>
      <Heading as="h1" size="xl" mb={2}>
        Reportes de Actividades
      </Heading>
      <Text fontSize="lg" color="gray.500" mb={8}>
        Revisa y gestiona los reportes de cada actividad.
      </Text>

      <ActivitiesReportsTable
        mode="reports"
        activities={activities}
        currentReportCheckedFilter={reportCheckedFilter || ''}
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </Box>
  )
}