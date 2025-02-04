import { NextResponse } from 'next/server'
import prisma from '@/lib/database/prisma'

export async function GET() {
  try {
    const languages = await prisma.language.findMany({
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(languages)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar idiomas' },
      { status: 500 }
    )
  }
} 