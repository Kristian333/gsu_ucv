// /app/admin/grupo/[id]/actividades/page.tsx
import { Box, Heading, Text } from '@chakra-ui/react'
import { Metadata } from 'next'
import { ActivitiesReportsTable } from '@/components/ui/activities-admin-table'
import { ActivityBackend, GetActivitiesBackendResponse } from '@/types/activity'
import { apiServerRequest } from '@/utils/apiServer'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{
    status?: string
    page?: string
  }>
}

interface FetchGroupActivitiesResult {
  activities: ActivityBackend[]
  totalPages: number
  currentPage: number
}

async function getGroupActivities(
  groupId: string,
  status?: string,
  page: number = 1
): Promise<FetchGroupActivitiesResult> {
  const queryParams = new URLSearchParams({
    group_id: groupId,
    order: 'desc',
    page: String(page),
    limit: '10',
  })

  // Helper para formatear Date en DD-MM-YYYY
  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
  }

  const now = new Date()
  const todayStr = formatDate(now)

  if (status === 'future') {
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = formatDate(tomorrow)

    // Fecha fin: 2 años más a partir de hoy
    const futureTwoYears = new Date(now)
    futureTwoYears.setFullYear(futureTwoYears.getFullYear() + 2)
    const futureTwoYearsStr = formatDate(futureTwoYears)

    queryParams.append('start_date', tomorrowStr)
    queryParams.append('end_date', futureTwoYearsStr)
  } else if (status === 'in_progress') {
    queryParams.append('start_date', todayStr)
    queryParams.append('end_date', todayStr)
  } else if (status === 'pending_report') {
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = formatDate(yesterday)

    queryParams.append('start_date', '01-01-2020')
    queryParams.append('end_date', yesterdayStr)
    queryParams.append('has_actual_participants', 'false')
  } else if (status === 'pending_review') {
    queryParams.append('has_actual_participants', 'true')
    queryParams.append('report_checked', 'false')
  } else if (status === 'reviewed') {
    queryParams.append('has_actual_participants', 'true')
    queryParams.append('report_checked', 'true')
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
    console.error(`Failed to fetch activities for group ${groupId}:`, error)
    return { activities: [], totalPages: 1, currentPage: 1 }
  }
}

export const metadata: Metadata = {
  title: 'Actividades del Grupo | GSU',
  description: 'Consulta el historial de actividades asociadas al grupo de extensión.',
}

export default async function GroupActivitiesPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const resolvedSearchParams = await searchParams
  const statusFilter = resolvedSearchParams.status
  const currentPage = Number(resolvedSearchParams.page) || 1

  const { activities, totalPages } = await getGroupActivities(id, statusFilter, currentPage)

  return (
    <Box maxW="container.xl" mx="auto" py={10} px={6}>

      <Heading as="h1" size="xl" mb={2}>
        Actividades del Grupo
      </Heading>
      <Text fontSize="lg" color="gray.500" mb={8}>
        Gestiona y revisa todas las actividades registradas por este grupo.
      </Text>

      <ActivitiesReportsTable
        mode="group_activities"
        activities={activities}
        currentStatusFilter={statusFilter || ''}
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </Box>
  )
}