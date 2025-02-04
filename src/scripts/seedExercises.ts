import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedExercises() {
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

    // Create a listening exercise
    await prisma.exercise.create({
      data: {
        title: 'Basic Listening Exercise',
        description: 'Practice your listening skills with this basic exercise',
        content: 'Listen to the audio and answer the questions',
        type: 'listening',
        languageId: language.id,
        levelId: level.id,
        questions: {
          create: [
            {
              question: 'What did you hear in the audio?',
              options: JSON.stringify(['Option A', 'Option B', 'Option C', 'Option D']),
              correctAnswer: 'Option A'
            }
          ]
        }
      }
    })

    // Create a reading exercise
    await prisma.exercise.create({
      data: {
        title: 'Basic Reading Exercise',
        description: 'Practice your reading skills with this basic exercise',
        content: 'Read the text and answer the questions',
        type: 'reading',
        languageId: language.id,
        levelId: level.id,
        questions: {
          create: [
            {
              question: 'What is the main idea of the text?',
              options: JSON.stringify(['Option A', 'Option B', 'Option C', 'Option D']),
              correctAnswer: 'Option B'
            }
          ]
        }
      }
    })

    console.log('Exercises seeded successfully')
  } catch (error) {
    console.error('Error seeding exercises:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedExercises() 