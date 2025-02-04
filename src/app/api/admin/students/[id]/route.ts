import { NextResponse } from 'next/server'
import prisma from '@/lib/database/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { hashPassword } from '@/lib/auth/password-utils'

export async function PUT(
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

    const data = await request.json()
    const { id } = params

    // Verificar se o email já está em uso por outro usuário
    const existingUser = await prisma.user.findFirst({
      where: {
        email: data.email,
        NOT: { id }
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já está em uso' },
        { status: 400 }
      )
    }

    // Atualizar usuário e matrículas
    const updatedUser = await prisma.$transaction(async (tx) => {
      // Atualizar dados do usuário
      const updateData: any = {
        name: data.name,
        email: data.email,
      }

      if (data.password) {
        updateData.password = await hashPassword(data.password)
      }

      const user = await tx.user.update({
        where: { id },
        data: updateData,
        include: {
          studentProfile: true
        }
      })

      // Atualizar matrículas
      if (user.studentProfile) {
        // Remover matrículas antigas
        await tx.enrollment.deleteMany({
          where: { studentProfileId: user.studentProfile.id }
        })

        // Criar novas matrículas
        await tx.enrollment.createMany({
          data: data.enrollments.map((enrollment: any) => ({
            studentProfileId: user.studentProfile.id,
            languageId: enrollment.languageId,
            levelId: enrollment.levelId,
            status: 'ACTIVE'
          }))
        })
      }

      // Retornar usuário atualizado com todas as relações
      return tx.user.findUnique({
        where: { id },
        include: {
          studentProfile: {
            include: {
              enrollments: {
                include: {
                  language: true,
                  level: true
                }
              }
            }
          }
        }
      })
    })

    return NextResponse.json({ user: updatedUser })

  } catch (error) {
    console.error('Erro ao atualizar aluno:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar aluno' },
      { status: 500 }
    )
  }
} 