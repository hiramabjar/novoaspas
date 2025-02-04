import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth/password-utils'
import { StudentFormData } from '@/types/student'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const students = await prisma.user.findMany({
      where: {
        role: 'student'
      },
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

    return NextResponse.json({ students })
  } catch (error) {
    console.error('Error fetching students:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const data: StudentFormData = await request.json()
    const hashedPassword = data.password ? await hashPassword(data.password) : null

    const student = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: 'student',
        studentProfile: {
          create: {
            enrollments: {
              create: data.enrollments.map(enrollment => ({
                languageId: enrollment.languageId,
                levelId: enrollment.levelId
              }))
            }
          }
        }
      },
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

    return NextResponse.json(student)
  } catch (error) {
    console.error('Error creating student:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 