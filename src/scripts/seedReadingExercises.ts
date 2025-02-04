import prisma from '@/lib/database/prisma'

async function seedReadingExercises() {
  try {
    // Buscar idioma inglês e nível iniciante
    const english = await prisma.language.findFirst({
      where: { code: 'EN' }
    });
    
    const beginnerLevel = await prisma.level.findFirst({
      where: { code: 'A1' }
    });

    // Criar ou buscar um módulo de leitura
    const readingModule = await prisma.module.create({
      data: {
        name: 'Reading Comprehension',
        description: 'Exercícios de compreensão de texto',
        order: 1
      }
    });

    if (!english || !beginnerLevel) {
      throw new Error('Idioma ou nível não encontrado');
    }

    // Criar exercício de leitura - "My Wonderful Family"
    const familyExercise = await prisma.exercise.create({
      data: {
        title: 'My Wonderful Family',
        description: 'Um texto simples sobre família para praticar leitura e compreensão.',
        content: `I live in a house near the mountains. I have two brothers and one sister, and I was born last. My father teaches mathematics, and my mother is a nurse at a big hospital. My brothers are very smart and work hard in school. My sister is a nervous girl, but she is very kind. My grandmother also lives with us. She came from Italy when I was two years old. She has grown old, but she is still very strong. She cooks the best food!
My family is very important to me. We do lots of things together. My brothers help me with my homework, and I help them clean the house. My sister helps our mother with the cooking. My father spends a lot of time with us in our backyard. We play football together. My grandmother tells us stories about Italy.
I love my family very much.`,
        type: 'READING',
        moduleId: readingModule.id,
        languageId: english.id,
        levelId: beginnerLevel.id,
        questions: {
          create: [
            {
              question: 'Where does the author live?',
              optionsJson: JSON.stringify([
                'In a house near the mountains',
                'In a big city',
                'In Italy',
                'Near the hospital'
              ]),
              correctAnswer: 'In a house near the mountains'
            },
            {
              question: 'What does the father do?',
              optionsJson: JSON.stringify([
                'He is a doctor',
                'He teaches mathematics',
                'He works in a hospital',
                'He is a nurse'
              ]),
              correctAnswer: 'He teaches mathematics'
            },
            {
              question: 'What does the grandmother do for the family?',
              optionsJson: JSON.stringify([
                'She helps with homework',
                'She works at the hospital',
                'She cooks the best food',
                'She teaches Italian'
              ]),
              correctAnswer: 'She cooks the best food'
            },
            {
              question: 'What do they do together as a family?',
              optionsJson: JSON.stringify([
                'They watch TV',
                'They play football',
                'They go to Italy',
                'They work at the hospital'
              ]),
              correctAnswer: 'They play football'
            }
          ]
        }
      }
    });

    // Criar exercício de leitura - "My Day"
    const myDayExercise = await prisma.exercise.create({
      data: {
        title: 'My Day',
        description: 'Um texto sobre a rotina diária para praticar leitura e compreensão.',
        content: `I wake up at 6:30 am every morning. I get dressed and eat breakfast. I usually have cereal with milk and a banana. Sometimes I have eggs and toast. I brush my teeth and pack my school bag.

I walk to school because it's very close to my house. School starts at 8:00 am. I have different classes: Math, English, Science, and History. My favorite subject is Science. We have lunch at 12:00 pm in the cafeteria.

After school, I do my homework and play with my friends. We like to ride our bikes in the park. I have dinner with my family at 6:00 pm. Then I read a book or watch TV. I go to bed at 9:00 pm.

I like my daily routine!`,
        type: 'READING',
        moduleId: readingModule.id,
        languageId: english.id,
        levelId: beginnerLevel.id,
        questions: {
          create: [
            {
              question: 'What time does the author wake up?',
              optionsJson: JSON.stringify([
                '6:00 am',
                '6:30 am',
                '7:00 am',
                '8:00 am'
              ]),
              correctAnswer: '6:30 am'
            },
            {
              question: 'How does the author go to school?',
              optionsJson: JSON.stringify([
                'By bus',
                'By car',
                'By bike',
                'Walking'
              ]),
              correctAnswer: 'Walking'
            },
            {
              question: 'What is the author\'s favorite subject?',
              optionsJson: JSON.stringify([
                'Math',
                'English',
                'Science',
                'History'
              ]),
              correctAnswer: 'Science'
            }
          ]
        }
      }
    });

    console.log('Exercícios de leitura cadastrados com sucesso!');
  } catch (error) {
    console.error('Erro ao cadastrar exercícios de leitura:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedReadingExercises(); 