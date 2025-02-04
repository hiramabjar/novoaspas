import prisma from '../lib/database/prisma'
import { hashPassword } from '../lib/auth/password-utils'

async function seed() {
  try {
    // 1. Criar admin
    const admin = await prisma.user.create({
      data: {
        name: 'Administrador',
        email: 'admin@escola.com',
        password: await hashPassword('Admin@123'),
        role: 'admin'
      }
    })
    console.log('Admin criado')

    // 2. Criar idiomas
    const languages = await Promise.all([
      prisma.language.create({
        data: { name: 'Inglês', code: 'EN' }
      }),
      prisma.language.create({
        data: { name: 'Espanhol', code: 'ES' }
      }),
      prisma.language.create({
        data: { name: 'Alemão', code: 'DE' }
      }),
      prisma.language.create({
        data: { name: 'Italiano', code: 'IT' }
      }),
      prisma.language.create({
        data: { name: 'Francês', code: 'FR' }
      })
    ])
    console.log('Idiomas criados')

    // 3. Criar níveis
    const levels = await Promise.all([
      prisma.level.create({
        data: { name: 'Iniciante', code: 'A1' }
      }),
      prisma.level.create({
        data: { name: 'Básico', code: 'A2' }
      }),
      prisma.level.create({
        data: { name: 'Intermediário', code: 'B1' }
      })
    ])
    console.log('Níveis criados')

    // 4. Criar módulo padrão
    const module = await prisma.module.create({
      data: {
        name: 'Reading Exercises',
        description: 'Módulo de exercícios de leitura',
        order: 1
      }
    })
    console.log('Módulo criado')

    // 5. Criar exercícios
    const exercise1 = await prisma.exercise.create({
      data: {
        title: 'Leitura - Present Simple',
        description: 'Exercício de leitura sobre o Present Simple',
        content: 'The Present Simple is used to talk about habits, routines, and facts...',
        type: 'READING',
        moduleId: module.id,
        languageId: languages[0].id,
        levelId: levels[0].id
      }
    })

    const exercise2 = await prisma.exercise.create({
      data: {
        title: 'Vocabulário - Família',
        description: 'Aprenda palavras relacionadas à família',
        content: 'Family members vocabulary: mother, father, sister, brother...',
        type: 'VOCABULARY',
        moduleId: module.id,
        languageId: languages[0].id,
        levelId: levels[0].id
      }
    })

    console.log('Exercícios criados')

    // 6. Criar questões
    await Promise.all([
      // Questões para o exercício 1
      prisma.question.create({
        data: {
          exerciseId: exercise1.id,
          question: "Qual é o principal uso do Present Simple?",
          options: JSON.stringify([
            "Expressar ações no passado",
            "Expressar ações habituais e verdades gerais",
            "Expressar ações futuras",
            "Expressar ações em andamento"
          ]),
          correctAnswer: "Expressar ações habituais e verdades gerais"
        }
      }),
      prisma.question.create({
        data: {
          exerciseId: exercise1.id,
          question: "Como se forma a terceira pessoa do singular no Present Simple?",
          options: JSON.stringify([
            "Adiciona-se 'ing' ao verbo",
            "Adiciona-se 's' ou 'es' ao verbo",
            "O verbo não muda",
            "Adiciona-se 'ed' ao verbo"
          ]),
          correctAnswer: "Adiciona-se 's' ou 'es' ao verbo"
        }
      }),

      // Questões para o exercício 2
      prisma.question.create({
        data: {
          exerciseId: exercise2.id,
          question: "Como se diz 'tia' em inglês?",
          options: JSON.stringify([
            "Uncle",
            "Aunt",
            "Sister",
            "Mother"
          ]),
          correctAnswer: "Aunt"
        }
      }),
      prisma.question.create({
        data: {
          exerciseId: exercise2.id,
          question: "Qual é a tradução de 'irmão'?",
          options: JSON.stringify([
            "Sister",
            "Father",
            "Brother",
            "Son"
          ]),
          correctAnswer: "Brother"
        }
      })
    ])

    console.log('Questões criadas')

    // 7. Criar aluno de teste
    const student = await prisma.user.create({
      data: {
        name: 'Aluno Teste',
        email: 'aluno@teste.com',
        password: await hashPassword('Aluno@123'),
        role: 'student',
        studentProfile: {
          create: {
            enrollments: {
              create: {
                languageId: languages[0].id,
                levelId: levels[0].id,
                status: 'ACTIVE'
              }
            }
          }
        }
      }
    })
    console.log('Aluno de teste criado')

    console.log('Seed concluído com sucesso!')
  } catch (error) {
    console.error('Erro durante o seed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

seed() 