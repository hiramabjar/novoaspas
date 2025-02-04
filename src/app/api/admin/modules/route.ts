import { NextResponse } from 'next/server'
import prisma from '@/lib/database/prisma'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Verifica se já existe um módulo com o mesmo nome
    let module = await prisma.module.findFirst({
      where: { name: data.name }
    })

    // Se não existir, cria um novo
    if (!module) {
      module = await prisma.module.create({
        data: {
          name: data.name,
          description: data.description,
          order: data.order
        }
      })
    }

    return NextResponse.json(module)
  } catch (error) {
    console.error('Erro ao criar/buscar módulo:', error)
    return NextResponse.json(
      { error: 'Erro ao criar/buscar módulo' },
      { status: 500 }
    )
  }
} 