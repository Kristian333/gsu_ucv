// /app/admin/grupo/[id]/actividades/page.tsx
import { Box, Heading, Text, Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react'
import { Metadata } from 'next'
import Link from 'next/link'
import { ActivitiesReportsTable } from '@/components/ui/activities-reports-table'
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

  if (status) {
    queryParams.append('status', status)
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
      {/* NAVEGACIÓN SECUNDARIA / BREADCRUMBS */}
      <Breadcrumb mb={4} color="gray.500" fontSize="sm">
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} href="/admin/grupos">
            Grupos
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} href={`/admin/grupo/${id}`}>
            Detalle del Grupo
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage color="teal.600" fontWeight="bold">
          <BreadcrumbLink>Actividades</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

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