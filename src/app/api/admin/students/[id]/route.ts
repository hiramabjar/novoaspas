import { NextResponse } from 'next/server'
import prisma from '@/lib/database/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { hashPassword } from '@/lib/auth/password-utils'
import { Prisma, PrismaClient } from '@prisma/client'

interface UpdateStudentData {
  name: string
  email: string
  password?: string
  enrollments: Array<{
    languageId: string
    levelId: string
  }>
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json() as UpdateStudentData
    const { id } = params

    // Check if email is already in use by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email: data.email,
        NOT: { id }
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email is already in use' },
        { status: 400 }
      )
    }

    // Update user and enrollments
    const updatedUser = await prisma.$transaction(async (prisma) => {
      // Update user data
      const updateData: Prisma.UserUpdateInput = {
        name: data.name,
        email: data.email,
      }

      if (data.password) {
        updateData.password = await hashPassword(data.password)
      }

      const user = await prisma.user.update({
        where: { id },
        data: updateData,
        include: {
          studentProfile: true
        }
      })

      // Update enrollments if student profile exists
      if (user.studentProfile) {
        // Remove old enrollments
        await prisma.enrollment.deleteMany({
          where: { 
            studentProfileId: user.studentProfile.id 
          }
        })

        // Create new enrollments
        if (data.enrollments && data.enrollments.length > 0) {
          await prisma.enrollment.createMany({
            data: data.enrollments.map(enrollment => ({
              studentProfileId: user.studentProfile!.id,
              languageId: enrollment.languageId,
              levelId: enrollment.levelId,
              status: 'active'
            }))
          })
        }
      }

      // Return updated user with all relations
      return prisma.user.findUnique({
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
    console.error('Error updating student:', error)
    return NextResponse.json(
      { error: 'Error updating student' },
      { status: 500 }
    )
  }
} 