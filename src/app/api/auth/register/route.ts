import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return new NextResponse('Missing fields', { status: 400 })
    }

    // Verifica se já existe um usuário com este email
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return new NextResponse('User already exists', { status: 400 })
    }

    // Hash da senha
    const hashedPassword = await hash(password, 10)

    // Cria o usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'student',
      }
    })

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      }
    })
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 })
  }
} 