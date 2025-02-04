import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/database/prisma'
import { hashPassword } from '@/lib/auth/password-utils'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const data = await request.json()
    
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(data.password)

    const user = await prisma.$transaction(async (tx) => {
      // Criar usuário
      const newUser = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          role: 'student'
        }
      })

      // Criar perfil com múltiplas matrículas
      await tx.studentProfile.create({
        data: {
          userId: newUser.id,
          enrollments: {
            create: data.enrollments.map((enrollment: any) => ({
              languageId: enrollment.languageId,
              levelId: enrollment.levelId,
              status: 'ACTIVE'
            }))
          }
        }
      })

      return newUser
    })

    return NextResponse.json({ user }, { status: 201 })

  } catch (error) {
    console.error('Erro:', error)
    return NextResponse.json(
      { error: 'Erro ao criar aluno' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'student' },
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

    return new NextResponse(
      JSON.stringify({ students }), 
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: 'Erro ao buscar alunos' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
} 