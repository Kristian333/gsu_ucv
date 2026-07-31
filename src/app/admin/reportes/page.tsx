import { ActivitiesReportsTable } from '@/components/ui/activities-reports-table'
import { ActivityBackend, GetActivitiesBackendResponse } from '@/types/activity'

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

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

  try {
    const res = await fetch(`${API_URL}/activities?${queryParams.toString()}`, {
      cache: 'no-store',
    })

    if (!res.ok) {
      console.error('Error fetching activities reports:', res.statusText)
      return { activities: [], totalPages: 1, currentPage: 1 }
    }

    const data: GetActivitiesBackendResponse = await res.json()

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

export default async function ReportsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams
  const reportCheckedFilter = resolvedSearchParams.report_checked
  const currentPage = Number(resolvedSearchParams.page) || 1

  const { activities, totalPages } = await getActivitiesReports(
    reportCheckedFilter,
    currentPage
  )

  return (
    <main style={{ padding: '2rem' }}>
      <ActivitiesReportsTable
        activities={activities}
        currentReportCheckedFilter={reportCheckedFilter || ''}
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </main>
  )
}