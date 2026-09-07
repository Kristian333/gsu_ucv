// /app/admin/grupo/[id]/estadisticas/page.tsx
import React from 'react'
import {
  Box,
  Heading,
  Text,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@chakra-ui/react'
import { Metadata } from 'next'
import Link from 'next/link'
import GraficaGrupos from '@/components/formularios/graficas-grupos'

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: 'Estadísticas del Grupo | GSU',
  description: 'Visualización detallada de métricas y analíticas del grupo de extensión.',
}

export default async function AdminGrupoEstadisticasPage({ params }: PageProps) {
  const { id } = await params

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
          <BreadcrumbLink>Estadísticas</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      {/* CABECERA DE LA PÁGINA */}
      <Box mb={8}>
        <Heading as="h1" size="xl" mb={2}>
          Estadísticas del Grupo
        </Heading>
        <Text fontSize="lg" color="gray.500">
          Consulta y analiza el rendimiento, participación e impacto de este grupo de extensión.
        </Text>
      </Box>

      {/* REUTILIZACIÓN DEL COMPONENTE DE GRÁFICAS */}
      <GraficaGrupos idGrupo={id} />
    </Box>
  )
}