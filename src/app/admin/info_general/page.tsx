// /app/admin/info_general/page.tsx
import React from 'react'
import { Box, Heading, Text } from '@chakra-ui/react'
import { Metadata } from 'next'
import fs from 'fs/promises'
import path from 'path'
import { GeneralData } from '@/types/general-info'
import { InfoGeneralEditor } from '@/components/ui/info-general-editor'

export const metadata: Metadata = {
  title: 'Información General | GSU',
  description: 'Gestión de datos de autoridades de la DEU, coordinadores y formatos.',
}

async function getGeneralData(): Promise<GeneralData> {
  try {
    const jsonPath = path.join(process.cwd(), 'data', 'general_data.json')
    const fileContent = await fs.readFile(jsonPath, 'utf-8')
    return JSON.parse(fileContent)
  } catch (error) {
    console.error('Failed to load local general_data.json:', error)
    return {
      info: '',
      pie_pagina: '',
      contacto: { email_gsu: '', telefono_gsu: '', direccion_deu: '' },
      UCV: [],
    }
  }
}

export default async function InfoGeneralPage() {
  const initialData = await getGeneralData()

  const saveGeneralData = async (data: GeneralData): Promise<boolean> => {
    'use server'
    try {
      const jsonPath = path.join(process.cwd(), 'data', 'general_data.json')
      await fs.writeFile(jsonPath, JSON.stringify(data, null, 2), 'utf-8')
      return true
    } catch (err) {
      console.error('Server action save error:', err)
      return false
    }
  }

  return (
    <Box maxW="container.xl" mx="auto" py={10} px={6}>
      <Heading as="h1" size="xl" mb={2}>
        Información General de la DEU
      </Heading>
      <Text fontSize="lg" color="gray.500" mb={8}>
        Administra la información directiva, los datos de los coordinadores por facultad y las plantillas de formatos.
      </Text>

      <InfoGeneralEditor initialData={initialData} onSave={saveGeneralData} />
    </Box>
  )
}