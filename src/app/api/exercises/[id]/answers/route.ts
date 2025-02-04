import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

interface Answer {
  questionId: string
  answer: string
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { answers } = await request.json() as { answers: Answer[] }

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Invalid answers format' },
        { status: 400 }
      )
    }

    // Get exercise with questions
    const exercise = await prisma.exercise.findUnique({
      where: { id: params.id },
      include: { questions: true }
    })

    if (!exercise) {
      return NextResponse.json(
        { error: 'Exercise not found' },
        { status: 404 }
      )
    }

    // Calculate score
    let correctAnswers = 0
    const totalQuestions = exercise.questions.length

    answers.forEach((answer: Answer) => {
      const question = exercise.questions.find(q => q.id === answer.questionId)
      if (question && question.correctAnswer === answer.answer) {
        correctAnswers++
      }
    })

    const score = Math.round((correctAnswers / totalQuestions) * 100)

    // Create attempt record
    const attempt = await prisma.exerciseAttempt.create({
      data: {
        exercise: {
          connect: { id: params.id }
        },
        user: {
          connect: { id: session.user.id }
        },
        score,
        answers: JSON.stringify(answers),
        completedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      score,
      correctAnswers,
      totalQuestions,
      attemptId: attempt.id
    })
  } catch (error) {
    console.error('Error submitting answers:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 