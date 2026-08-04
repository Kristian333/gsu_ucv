// /app/admin/actividad/[id]/page.tsx
import { Box } from '@chakra-ui/react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ActivityDetailView } from '@/components/ui/activity-detail-view'
import { apiServerRequest } from '@/utils/apiServer'
import { ActivityBackend } from '@/types/activity'

interface ActivityPageProps {
  params: Promise<{
    id: string
  }>
}

async function getActivity(id: string): Promise<ActivityBackend | null> {
  try {
    const data = await apiServerRequest(`activities/${id}`, {
      cache: 'no-store',
    })
    return data || null
  } catch (error) {
    console.error(`Error cargando la actividad ${id}:`, error)
    return null
  }
}

export async function generateMetadata({ params }: ActivityPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const activity = await getActivity(resolvedParams.id)

  return {
    title: activity ? `${activity.nombre} | Detalles de Actividad` : 'Actividad no encontrada',
    description: 'Detalles del reporte y desarrollo de la actividad de extensión.',
  }
}

export default async function AdminActivityPage({ params }: ActivityPageProps) {
  const resolvedParams = await params
  const activity = await getActivity(resolvedParams.id)

  if (!activity) {
    notFound()
  }

  return (
    <Box maxW="container.xl" mx="auto" py={8} px={6}>
      <ActivityDetailView initialActivity={activity} />
    </Box>
  )
}