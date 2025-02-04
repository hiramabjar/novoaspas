import prisma from '@/lib/database/prisma'
import { hashPassword } from '../lib/auth/password-utils'

async function seedStudents() {
  try {
    // Buscar idioma e nível para associar
    const english = await prisma.language.findFirst({
      where: { code: 'EN' }
    });
    
    const beginnerLevel = await prisma.level.findFirst({
      where: { code: 'A1' }
    });

    if (!english || !beginnerLevel) {
      throw new Error('Idioma ou nível não encontrado');
    }

    // Criar alunos
    const students = await Promise.all([
      prisma.user.create({
        data: {
          name: 'João Silva',
          email: 'joao@exemplo.com',
          password: await hashPassword('senha123'),
          role: 'student',
          studentProfile: {
            create: {
              enrollments: {
                create: {
                  languageId: english.id,
                  levelId: beginnerLevel.id,
                  status: 'ACTIVE'
                }
              }
            }
          }
        }
      }),
      prisma.user.create({
        data: {
          name: 'Maria Santos',
          email: 'maria@exemplo.com',
          password: await hashPassword('senha123'),
          role: 'student',
          studentProfile: {
            create: {
              enrollments: {
                create: {
                  languageId: english.id,
                  levelId: beginnerLevel.id,
                  status: 'ACTIVE'
                }
              }
            }
          }
        }
      })
    ]);

    console.log('Alunos cadastrados com sucesso!');
  } catch (error) {
    console.error('Erro ao cadastrar alunos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedStudents(); 