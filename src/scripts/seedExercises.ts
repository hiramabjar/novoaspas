import prisma from '@/lib/database/prisma'

async function seedExercises() {
  try {
    // Primeiro, buscar um idioma e nível para associar
    const english = await prisma.language.findFirst({
      where: { code: 'EN' }
    });
    
    const beginnerLevel = await prisma.level.findFirst({
      where: { code: 'A1' }
    });

    if (!english || !beginnerLevel) {
      throw new Error('Idioma ou nível não encontrado');
    }

    // Criar exercícios
    const exercises = await Promise.all([
      prisma.exercise.create({
        data: {
          title: 'Present Simple - Exercício 1',
          description: 'Complete as frases com o Present Simple correto',
          content: 'I ___ (to be) a student.\nShe ___ (to work) at a hospital.',
          answers: ['am', 'works'],
          languageId: english.id,
          levelId: beginnerLevel.id,
          type: 'FILL_BLANKS'
        }
      }),
      prisma.exercise.create({
        data: {
          title: 'Vocabulário - Família',
          description: 'Escolha a palavra correta para cada membro da família',
          content: 'Multiple choice exercise about family members',
          answers: ['mother', 'father', 'sister', 'brother'],
          languageId: english.id,
          levelId: beginnerLevel.id,
          type: 'MULTIPLE_CHOICE'
        }
      })
    ]);

    console.log('Exercícios cadastrados com sucesso!');
  } catch (error) {
    console.error('Erro ao cadastrar exercícios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedExercises(); 