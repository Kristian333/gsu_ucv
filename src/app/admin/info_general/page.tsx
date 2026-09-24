// /app/admin/info_general/page.tsx
import React from 'react'
import { Box, Heading, Text } from '@chakra-ui/react'
import { Metadata } from 'next'
import fs from 'fs/promises'
import path from 'path'
import { revalidatePath } from 'next/cache'
import { GeneralData } from '@/types/general-info'
import { InfoGeneralEditor } from '@/components/ui/info-general-editor'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Información General | GSU',
  description: 'Gestión de datos de autoridades de la DEU, coordinadores y formatos.',
}

const jsonPath = path.join(process.cwd(), 'src', 'data', 'general_data.json')

export default async function InfoGeneralPage() {
  const fileContent = await fs.readFile(jsonPath, 'utf-8')
  const initialData = JSON.parse(fileContent) as GeneralData

  const saveGeneralData = async (data: GeneralData): Promise<boolean> => {
    'use server'
    try {
      await fs.writeFile(jsonPath, JSON.stringify(data, null, 2), 'utf-8')
      revalidatePath('/admin/info_general')
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