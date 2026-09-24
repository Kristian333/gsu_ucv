// /app/api/general-info/route.ts
import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { GeneralData } from '@/types/general-info'

export const dynamic = 'force-dynamic'

const jsonFilePath = path.join(process.cwd(), 'data', 'general_data.json')

export async function GET() {
  try {
    const fileContent = await fs.readFile(jsonFilePath, 'utf-8')
    const data: GeneralData = JSON.parse(fileContent)
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (error) {
    console.error('Error al leer general_data.json:', error)
    return NextResponse.json(
      { error: 'Error al consultar los datos generales.' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body: GeneralData = await request.json()
    await fs.writeFile(jsonFilePath, JSON.stringify(body, null, 2), 'utf-8')
    return NextResponse.json({ success: true, data: body })
  } catch (error) {
    console.error('Error al guardar en general_data.json:', error)
    return NextResponse.json(
      { error: 'Error al guardar los datos generales.' },
      { status: 500 }
    )
  }
}