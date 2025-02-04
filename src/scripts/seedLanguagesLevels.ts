import prisma from '@/lib/database/prisma'

async function seedLanguagesLevels() {
  try {
    // Cadastrar idiomas
    const languages = await Promise.all([
      prisma.language.create({
        data: { name: 'Inglês', code: 'EN' }
      }),
      prisma.language.create({
        data: { name: 'Espanhol', code: 'ES' }
      }),
      prisma.language.create({
        data: { name: 'Francês', code: 'FR' }
      })
    ]);

    // Cadastrar níveis
    const levels = await Promise.all([
      prisma.level.create({
        data: { name: 'Iniciante', code: 'A1' }
      }),
      prisma.level.create({
        data: { name: 'Básico', code: 'A2' }
      }),
      prisma.level.create({
        data: { name: 'Intermediário', code: 'B1' }
      }),
      prisma.level.create({
        data: { name: 'Intermediário Avançado', code: 'B2' }
      }),
      prisma.level.create({
        data: { name: 'Avançado', code: 'C1' }
      })
    ]);

    console.log('Idiomas e níveis cadastrados com sucesso!');
  } catch (error) {
    console.error('Erro ao cadastrar idiomas e níveis:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedLanguagesLevels(); 