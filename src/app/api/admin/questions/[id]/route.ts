import { NextResponse } from 'next/server'
import prisma from '@/lib/database/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { id } = params

    await prisma.question.delete({
      where: { id }
    })

    return new NextResponse(null, { status: 204 })

  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: 'Erro ao excluir questão' }),
      { status: 500 }
    )
  }
} 