// @/components/ui/activity-detail-view.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/app/context/auth-context'
import { validateGroupAccess } from '@/utils/auth-guards'
import {
  Box,
  Heading,
  Text,
  Badge,
  Button,
  Flex,
  Stack,
  SimpleGrid,
  Image,
  Divider,
  useToast,
  HStack,
  Card,
  CardBody,
  Tooltip,
  Center,
  Spinner,
} from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { SiGoogledrive } from 'react-icons/si'
import { ArrowBackIcon, CheckCircleIcon, ExternalLinkIcon, StarIcon } from '@chakra-ui/icons'
import { useRouter } from 'next/navigation'
import NextLink from 'next/link'
import { ActivityBackend } from '@/types/activity'
import { formatActivityDateRange, getActivityStatus, formatListToString } from '@/utils/common'
import { apiRequest } from '@/components/formularios/api'

// Keyframe para animación de los puntos suspensivos (opacity pulse)
const pulseDots = keyframes`
  0% { opacity: 0.2; }
  50% { opacity: 1; }
  100% { opacity: 0.2; }
`

export type UserRole = 'admin' | 'admingroup'

interface ActivityDetailViewProps {
  initialActivity: ActivityBackend
  userRole?: UserRole
}

export function ActivityDetailView({ initialActivity, userRole = 'admin' }: ActivityDetailViewProps) {
  const router = useRouter()
  const toast = useToast()
  const { user, isHydrated } = useAuth()

  const [activity, setActivity] = useState<ActivityBackend>(initialActivity)
  const [isUpdating, setIsUpdating] = useState<boolean>(false)
  const [isAuthorized, setIsAuthorized] = useState<boolean>(userRole !== 'admingroup')
  const areaDisplay = formatListToString(activity.area_conocimiento)

  // Validación de acceso por grupo (Client Side Guard)
  useEffect(() => {
    if (!isHydrated || userRole !== 'admingroup') return;

    const { hasAccess, reason } = validateGroupAccess(activity, user);

    if (!hasAccess) {
      toast({
        title: 'Acceso Denegado',
        description: reason || 'No tienes permisos para ver esta actividad.',
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top',
      });
      router.push('/admingroup/nuestras_actividades');
    } else {
      setIsAuthorized(true);
    }
  }, [isHydrated, user, userRole, activity, router, toast]);

  // Si no se ha hidratado o no tiene autorización para admingroup, mostrar un loader o pantalla limpia
  if (!isHydrated || !isAuthorized) {
    return (
      <Center h="50vh">
        <Spinner size="xl" color="primary.500" thickness="4px" />
      </Center>
    )
  }

  const dateRangeStr = formatActivityDateRange(activity.fecha_inicio, activity.fecha_fin)
  const statusInfo = getActivityStatus(activity)

  // Condición para evaluar si la actividad ya finalizó
  const esFutura = statusInfo.label === 'Actividad Futura'
  const enCurso = statusInfo.label === 'Actividad En Curso'
  const esFinalizada = !esFutura && !enCurso

  // Condición para mostrar el botón de acción del reporte (Solo Administrador)
  const canToggleReportStatus =
    userRole === 'admin' &&
    (statusInfo.label === 'Reporte Pendiente de Revisión' ||
    statusInfo.label === 'Reporte Revisado')

  // Manejar el toggle de revisión del reporte (ADMIN)
  const handleToggleReportCheck = async () => {
    setIsUpdating(true)
    const nextStatus = !activity.reporte_revisado

    try {
      await apiRequest('admin/activities/report-check', {
        method: 'PATCH',
        body: JSON.stringify({
          id: activity.id,
          reporte_revisado: nextStatus,
        }),
      })

      setActivity((prev) => ({ ...prev, reporte_revisado: nextStatus }))

      toast({
        title: nextStatus ? 'Reporte Marcado como Revisado' : 'Reporte Marcado como Pendiente',
        status: nextStatus ? 'success' : 'info',
        duration: 3000,
        isClosable: true,
        position: 'top',
      })
    } catch (error: any) {
      console.error('Error al actualizar reporte:', error)
      toast({
        title: 'Error de Servidor',
        description: error.message || 'No se pudo cambiar el estado de la revisión.',
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // Manejar el toggle para destacar actividad (ADMIN GROUP)
  const handleToggleFeatured = async () => {
    setIsUpdating(true)
    const nextFeaturedState = !activity.destacado

    try {
      const token = localStorage.getItem('token') || ''
      const idString = String(activity.id)

      const response = await apiRequest('activities/feature', {
        method: 'PATCH',
        body: JSON.stringify({
          id: idString,
          activity_id: idString,
          is_featured: nextFeaturedState,
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (response && !response.error) {
        setActivity((prev) => ({ ...prev, destacado: nextFeaturedState }))
        toast({
          title: nextFeaturedState ? 'Actividad destacada' : 'Destacado removido',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top',
        })
      } else {
        throw new Error(response?.message || 'Error al actualizar el estado destacado.')
      }
    } catch (error: any) {
      console.error('Error al destacar actividad:', error)
      toast({
        title: 'Error de Servidor',
        description: error.message || 'No se pudo actualizar el estado destacado.',
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // Regresar de manera segura a la pantalla anterior
  const handleGoBack = () => {
    if (window.history.length > 2) {
      router.back()
    } else {
      router.push(userRole === 'admin' ? '/admin/reportes' : '/admingroup/actividades')
    }
  }

  // Helper para renderizar el botón de acción de estado (reutilizado arriba y abajo)
  const renderToggleButton = (size: 'sm' | 'md' = 'sm') => {
    if (!canToggleReportStatus) return null

    return (
        <Button
        leftIcon={<CheckCircleIcon />}
        bg={activity.reporte_revisado ? 'warning' : 'success'}
        color="white"
        _hover={{
          bg: activity.reporte_revisado ? 'orange.600' : 'green.600',
        }}
        size={size}
        isLoading={isUpdating}
        onClick={handleToggleReportCheck}
        >
        {activity.reporte_revisado ? 'Marcar como Pendiente' : 'Marcar como Revisado'}
        </Button>
    )
  }

  return (
    <Stack spacing={6}>
      {/* Barra de Acciones / Cabecera */}
      <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
        <Button
          leftIcon={<ArrowBackIcon />}
          variant="outline"
          size="sm"
          onClick={handleGoBack}
        >
          Volver
        </Button>

        <HStack spacing={3}>
          {/* Botón Ver en Sitio Público */}
          <Button
            as={NextLink}
            href={`/actividad/${activity.id}`}
            rightIcon={<ExternalLinkIcon />}
            colorScheme="primary"
            variant="outline"
            size="sm"
          >
            Ver en página pública
          </Button>

          {/* Botón de Estrella para Destacar (Solo Admin Group) */}
          {userRole === 'admingroup' && (
            <Tooltip
              label={
                !esFinalizada
                  ? 'Solo se pueden destacar actividades que ya hayan finalizado'
                  : activity.destacado
                  ? 'Quitar de destacadas'
                  : 'Marcar como destacada'
              }
              placement="top"
            >
              <Box display="inline-block">
                <Button
                  leftIcon={
                    <StarIcon 
                      color={activity.destacado ? 'yellow.400' : 'gray.400'} 
                      filter="drop-shadow(0px 0px 1px rgba(0, 0, 0, 0.9))"
                    />
                  }
                  colorScheme={activity.destacado ? 'yellow' : 'gray'}
                  variant="solid"
                  size="sm"
                  isLoading={isUpdating}
                  isDisabled={!esFinalizada}
                  onClick={handleToggleFeatured}
                >
                  {activity.destacado ? 'Destacada' : 'Destacar'}
                </Button>
              </Box>
            </Tooltip>
          )}

          {/* Botón de Revisión (Solo Admin) */}
          {canToggleReportStatus && renderToggleButton('sm')}
        </HStack>
      </Flex>

      {/* Tarjeta Principal de la Actividad */}
      <Card variant="outline" bg="white" borderRadius="xl" boxShadow="sm">
        <CardBody p={6}>
          <Stack spacing={6}>
            {/* Título, Grupo, Estado e Imagen */}
            <Flex direction={{ base: 'column', md: 'row' }} gap={6} justify="space-between">
              <Stack spacing={3} flex={1}>
                {/* Badges de Estado y Categorización */}
                <HStack wrap="wrap" spacing={2}>
                  {/* Badge de Estado Dinámico */}
                  <Badge
                    variant="solid"
                    colorScheme={statusInfo.colorScheme}
                    fontSize="sm"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    {statusInfo.label}
                    {statusInfo.label === 'Actividad En Curso' && (
                      <Box
                        as="span"
                        ml={1}
                        animation={`${pulseDots} 2s infinite ease-in-out`}
                      >
                        ...
                      </Box>
                    )}
                  </Badge>

                  {activity.destacado && (
                    <Badge colorScheme="yellow" variant="subtle" px={2.5} py={0.5}>
                      ★ Destacada por el Grupo
                    </Badge>
                  )}
                  {userRole !== 'admingroup' && activity.nombre_grupo && (
                    <Badge colorScheme="primary" variant="subtle" px={2.5} py={0.5}>
                      {activity.nombre_grupo}
                    </Badge>
                  )}
                </HStack>

                <Heading as="h1" size="lg" color="gray.800">
                  {activity.nombre || 'Sin nombre especificado'}
                </Heading>

                <Text fontSize="md" color="gray.600" fontWeight="medium">
                  📅 {dateRangeStr || 'Fecha no registrada'}
                </Text>
              </Stack>

              {/* Cubierta de la actividad */}
              <Box flexShrink={0} maxW={{ base: 'full', md: '240px' }}>
                <Image
                src={activity.cubierta}
                alt={activity.nombre}
                borderRadius="lg"
                objectFit="cover"
                maxH="160px"
                w="full"
                fallbackSrc="/imagen-no-disponible.jpg"
                />
              </Box>
            </Flex>

            <Divider />

            {/* Métrica de Asistencia y Participantes */}
            <Box>
              <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mb={3}>
                Participantes y Asistencia
              </Text>
              <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4}>
                <Box p={4} bg="gray.50" borderRadius="lg" borderLeft="4px solid" borderColor="primary.500">
                  <Text fontSize="xs" color="gray.600">
                    Miembros del Grupo
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                    {activity.participantes_grupo ?? 0}
                  </Text>
                </Box>
                <Box p={4} bg="gray.50" borderRadius="lg" borderLeft="4px solid" borderColor="secondary.500">
                  <Text fontSize="xs" color="gray.600">
                    Beneficiados Estimados
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                    {activity.participantes_estimados ?? 0}
                  </Text>
                </Box>
                <Box p={4} bg="gray.50" borderRadius="lg" borderLeft="4px solid" borderColor="success">
                  <Text fontSize="xs" color="gray.600">
                    Beneficiados Reales
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="primary.700">
                    {activity.participantes_reales ?? 0}
                  </Text>
                </Box>
              </SimpleGrid>
            </Box>

            <Divider />

            {/* Descripción y Contenido */}
            <Stack spacing={4}>
              <Box>
                <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mb={1}>
                  Descripción de la Actividad
                </Text>
                <Text color="gray.700" whiteSpace="pre-wrap">
                  {activity.descripcion || 'Sin descripción disponible.'}
                </Text>
              </Box>

              {activity.observaciones && (
                <Box p={4} bg="orange.50" borderLeft="4px solid" borderColor="warning" borderRadius="md">
                  <Text fontSize="xs" fontWeight="bold" color="warning" textTransform="uppercase" mb={1}>
                    Observaciones / Comentarios Adicionales
                  </Text>
                  <Text fontSize="sm" color="gray.800" whiteSpace="pre-wrap">
                    {activity.observaciones}
                  </Text>
                </Box>
              )}
            </Stack>

            <Divider />

            {/* Detalles Técnicos y Ubicación */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Box>
                <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mb={1}>
                  Ubicación
                </Text>
                <Text color="gray.800" fontWeight="medium">
                  {activity.ubicacion || 'No especificada'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mb={1}>
                  Área de Conocimiento
                </Text>
                <Text color="gray.800" fontWeight="medium">
                  {areaDisplay || 'No especificada'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mb={1}>
                  Aliados Estratégicos
                </Text>
                <Text color="gray.800" fontWeight="medium">
                  {activity.aliados || 'Sin aliados registrados'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mb={1}>
                  Financiamiento
                </Text>
                <Text color="gray.800" fontWeight="medium">
                  {activity.financiamiento || 'Sin información de financiamiento'}
                </Text>
              </Box>
            </SimpleGrid>

            <Divider />

            {/* Archivos y Evidencias */}
            <Box>
              <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mb={4}>
                Evidencias y Documentación
              </Text>

              <Flex wrap="wrap" gap={4} align="center" justify="space-between">
                <HStack wrap="wrap" spacing={4}>
                    {/* Botón Google Drive para Galería */}
                    {activity.galeria_url ? (
                    <Button
                        as="a"
                        href={activity.galeria_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        leftIcon={
                        <Image
                            src="/google_drive_icon.webp"
                            alt="Google Drive"
                            boxSize="18px"
                            objectFit="contain"
                        />
                        }
                        colorScheme="gray"
                        variant="outline"
                        borderColor="gray.300"
                        _hover={{ bg: 'gray.100' }}
                    >
                        Ver Galería en Drive
                    </Button>
                    ) : (
                    <Button
                        leftIcon={<SiGoogledrive size="18px" />}
                        isDisabled
                        variant="outline"
                    >
                        Ver Galería en Drive (No disponible)
                    </Button>
                    )}

                    {/* Lista de Participantes */}
                    {activity.lista_participantes && (
                    <Button
                        as="a"
                        href={activity.lista_participantes}
                        target="_blank"
                        rel="noopener noreferrer"
                        leftIcon={<ExternalLinkIcon />}
                        colorScheme="primary"
                        variant="outline"
                    >
                        Ver Lista de Participantes
                    </Button>
                    )}
                </HStack>
              </Flex>
            </Box>
          </Stack>
        </CardBody>
      </Card>

      {/* Botón de Marcar como Revisado (Solo Admin)*/}
      {canToggleReportStatus && (
        <Flex justify="flex-end">
          {renderToggleButton('md')}
        </Flex>
      )}
    </Stack>
  )
}
