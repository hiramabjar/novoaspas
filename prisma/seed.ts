import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

const LANGUAGES = [
  {
    id: 'en',
    name: 'Inglês',
    code: 'en-US'
  },
  {
    id: 'es',
    name: 'Espanhol',
    code: 'es-ES'
  },
  {
    id: 'de',
    name: 'Alemão',
    code: 'de-DE'
  },
  {
    id: 'it',
    name: 'Italiano',
    code: 'it-IT'
  },
  {
    id: 'fr',
    name: 'Francês',
    code: 'fr-FR'
  }
]

const LEVELS = [
  {
    id: 'beginner',
    name: 'Iniciante'
  },
  {
    id: 'intermediate',
    name: 'Intermediário'
  },
  {
    id: 'advanced',
    name: 'Avançado'
  }
]

async function main() {
  try {
    console.log('Starting seed...')

    // Criar usuário admin
    const adminPassword = await hash('admin123', 12)
    const admin = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        name: 'Admin User',
        password: adminPassword,
        role: 'admin'
      }
    })
    console.log('Admin user created:', admin)

    // Criar usuário estudante
    const studentPassword = await hash('student123', 12)
    const student = await prisma.user.upsert({
      where: { email: 'student@example.com' },
      update: {},
      create: {
        email: 'student@example.com',
        name: 'Student User',
        password: studentPassword,
        role: 'student',
        studentProfile: {
          create: {}
        }
      }
    })
    console.log('Student user created:', student)

    // Criar idiomas
    for (const language of LANGUAGES) {
      const createdLanguage = await prisma.language.upsert({
        where: { id: language.id },
        update: {
          name: language.name,
          code: language.code
        },
        create: {
          id: language.id,
          name: language.name,
          code: language.code
        }
      })
      console.log('Created language:', createdLanguage)
    }

    // Criar níveis
    for (const level of LEVELS) {
      const createdLevel = await prisma.level.upsert({
        where: { id: level.id },
        update: {
          name: level.name
        },
        create: {
          id: level.id,
          name: level.name,
          code: level.id
        }
      })
      console.log('Created level:', createdLevel)
    }

    // Criar módulos
    const readingModule = await prisma.module.upsert({
      where: { id: 'reading-module' },
      update: {
        name: 'Exercícios de Leitura',
        description: 'Módulo para exercícios de leitura e compreensão de texto'
      },
      create: {
        id: 'reading-module',
        name: 'Exercícios de Leitura',
        description: 'Módulo para exercícios de leitura e compreensão de texto',
        order: 1
      }
    })

    const listeningModule = await prisma.module.upsert({
      where: { id: 'listening-module' },
      update: {
        name: 'Exercícios de Listening',
        description: 'Módulo para exercícios de compreensão auditiva'
      },
      create: {
        id: 'listening-module',
        name: 'Exercícios de Listening',
        description: 'Módulo para exercícios de compreensão auditiva',
        order: 2
      }
    })

    console.log('Seed completed successfully!')
  } catch (error) {
    console.error('Error during seed:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 