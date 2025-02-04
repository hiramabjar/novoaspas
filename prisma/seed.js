const { PrismaClient } = require('@prisma/client')
const { hash } = require('bcryptjs')

const LANGUAGES = [
  { id: 'en', name: 'Inglês', code: 'en-US' },
  { id: 'es', name: 'Espanhol', code: 'es-ES' },
  { id: 'de', name: 'Alemão', code: 'de-DE' },
  { id: 'it', name: 'Italiano', code: 'it-IT' },
  { id: 'fr', name: 'Francês', code: 'fr-FR' }
]

const LEVELS = [
  { id: 'beginner', name: 'Iniciante' },
  { id: 'intermediate', name: 'Intermediário' },
  { id: 'advanced', name: 'Avançado' }
]

const prisma = new PrismaClient()

async function main() {
  try {
    // Criar usuário admin
    const adminPassword = await hash('admin123', 12)
    await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        name: 'Admin User',
        password: adminPassword,
        role: 'admin'
      }
    })

    // Criar usuário estudante
    const studentPassword = await hash('student123', 12)
    await prisma.user.upsert({
      where: { email: 'student@example.com' },
      update: {},
      create: {
        email: 'student@example.com',
        name: 'Student User',
        password: studentPassword,
        role: 'student'
      }
    })

    // Criar módulo padrão
    const defaultModule = await prisma.module.upsert({
      where: { id: 'default-module' },
      update: {},
      create: {
        id: 'default-module',
        name: 'Módulo Inicial',
        description: 'Módulo inicial para todos os exercícios',
        order: 1
      }
    })

    // Criar idiomas
    for (const language of LANGUAGES) {
      await prisma.language.upsert({
        where: { id: language.id },
        update: {},
        create: {
          id: language.id,
          name: language.name,
          code: language.code
        }
      })
    }

    // Criar níveis
    for (const level of LEVELS) {
      await prisma.level.upsert({
        where: { id: level.id },
        update: {},
        create: {
          id: level.id,
          name: level.name
        }
      })
    }

    console.log('Seed executado com sucesso!')
  } catch (error) {
    console.error('Erro durante o seed:', error)
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