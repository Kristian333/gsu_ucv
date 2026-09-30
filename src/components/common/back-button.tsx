// src/components/common/back-button.tsx
'use client'

import React from 'react'
import { Button, ButtonProps } from '@chakra-ui/react'
import { ArrowBackIcon } from '@chakra-ui/icons'
import { useRouter } from 'next/navigation'

export type BackButtonContext = 
  | 'activity-detail' 
  | 'public-activity-detail'
  | 'group-detail'
  | 'public-group-detail'
  | 'request-detail'
  | 'user-profile'

export interface BackButtonProps extends Omit<ButtonProps, 'onClick'> {
  context: BackButtonContext
  userRole?: 'admin' | 'admingroup' | 'adminfacultad'
  groupId?: string
  fallbackUrl?: string
}

export function BackButton({
  context,
  userRole = 'admin',
  groupId,
  fallbackUrl,
  children = 'Volver',
  ...buttonProps
}: BackButtonProps) {
  const router = useRouter()

  const handleGoBack = () => {
    // Caso específico para la vista pública de detalle de actividad
    if (context === 'public-activity-detail') {
      if (typeof window !== 'undefined') {
        const referrer = document.referrer
        // Si el usuario navegó internamente desde la página /actividades (con o sin query params)
        if (referrer && referrer.includes('/actividades')) {
          router.back()
          return
        }
      }
      
      // Fallback por defecto si entraron por URL directa, link externo o recarga
      router.push(fallbackUrl || '/actividades')
      return
    }

    // Caso específico para la vista pública de detalle de grupo (/grupo/[groupId])
    if (context === 'public-group-detail') {
      if (typeof window !== 'undefined') {
        const referrer = document.referrer
        // Si el usuario navegó internamente desde la lista pública /grupos
        if (referrer && referrer.includes('/grupos')) {
          router.back()
          return
        }
      }

      // Fallback por defecto si ingresó por enlace directo, recarga o referencia externa
      router.push(fallbackUrl || '/grupos')
      return
    }

    // Caso específico para detalle de solicitudes (/admin/solicitudes/[id] o /adminfacultad/solicitudes/[id])
    if (context === 'request-detail') {
      const targetDefaultUrl =
        userRole === 'adminfacultad'
          ? '/adminfacultad/solicitudes'
          : '/admin/solicitudes?tab=groups'

      if (typeof window !== 'undefined') {
        const referrer = document.referrer
        const expectedPath = userRole === 'adminfacultad' ? '/adminfacultad/solicitudes' : '/admin/solicitudes'

        // Verifica que venga de la ruta de solicitudes correspondiente a su rol
        if (referrer && referrer.includes(expectedPath)) {
          router.back()
          return
        }
      }

      router.push(fallbackUrl || targetDefaultUrl)
      return
    }

    // 1. Lógica para historial de navegación en otros contextos
    if (typeof window !== 'undefined' && window.history.length > 2) {
      const fromState = window.history.state?.from

      if (context === 'activity-detail') {
        if (fromState === 'reportes' && userRole === 'admin') {
          router.push('/admin/reportes')
          return
        }

        if (fromState === 'grupo_actividades' && groupId) {
          const basePath = userRole === 'adminfacultad' ? '/adminfacultad' : '/admin'
          router.push(`${basePath}/grupo/${groupId}/actividades`)
          return
        }
      }

      router.back()
      return
    }

    // 2. Fallbacks si no hay historial previo en el navegador
    if (fallbackUrl) {
      router.push(fallbackUrl)
      return
    }

    if (context === 'group-detail') {
      const basePath = userRole === 'adminfacultad' ? '/adminfacultad' : '/admin'
      router.push(`${basePath}/grupos`)
      return
    }

    if (context === 'activity-detail') {
      if (userRole === 'admingroup') {
        router.push('/admingroup/nuestras_actividades')
      } else {
        const basePath = userRole === 'adminfacultad' ? '/adminfacultad' : '/admin'

        if (groupId) {
          router.push(`${basePath}/grupo/${groupId}/actividades`)
        } else {
          router.push(userRole === 'admin' ? '/admin/reportes' : '/adminfacultad/grupos')
        }
      }
    } else {
      router.back()
    }
  }

  return (
    <Button
      leftIcon={<ArrowBackIcon />}
      variant="outline"
      size="sm"
      onClick={handleGoBack}
      {...buttonProps}
    >
      {children}
    </Button>
  )
}