import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedReadingExercises() {
  try {
    const language = await prisma.language.findFirst({
      where: { code: 'en' }
    })

    const level = await prisma.level.findFirst({
      where: { code: 'beginner' }
    })

    if (!language || !level) {
      throw new Error('Language or level not found')
    }

    // Create reading exercises
    await prisma.exercise.create({
      data: {
        title: 'Introduction to Reading',
        description: 'A basic reading exercise to practice comprehension',
        content: `
          Reading is an essential skill for learning any language. It helps you improve your vocabulary,
          grammar, and understanding of the language. This exercise will help you practice your reading
          comprehension skills.

          Please read the text carefully and answer the questions that follow.
        `,
        type: 'reading',
        languageId: language.id,
        levelId: level.id,
        questions: {
          create: [
            {
              question: 'What is the main purpose of reading in language learning?',
              options: JSON.stringify([
                'To improve vocabulary and grammar',
                'To practice speaking',
                'To learn pronunciation',
                'To meet new people'
              ]),
              correctAnswer: 'To improve vocabulary and grammar'
            },
            {
              question: 'What skills can you improve through reading?',
              options: JSON.stringify([
                'Only vocabulary',
                'Only grammar',
                'Vocabulary, grammar, and understanding',
                'Speaking and listening'
              ]),
              correctAnswer: 'Vocabulary, grammar, and understanding'
            }
          ]
        }
      }
    })

    console.log('Reading exercises seeded successfully')
  } catch (error) {
    console.error('Error seeding reading exercises:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedReadingExercises() 