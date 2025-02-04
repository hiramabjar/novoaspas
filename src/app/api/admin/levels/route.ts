import { NextResponse } from 'next/server'
import prisma from '@/lib/database/prisma'

export async function GET() {
  try {
    const levels = await prisma.level.findMany({
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(levels)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar níveis' },
      { status: 500 }
    )
  }
} 