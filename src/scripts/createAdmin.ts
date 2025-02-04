import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  try {
    // Leitura do arquivo de áudio
    const audioPath = path.join(process.cwd(), 'path/to/your/audio/files', 'audio.mp3')
    const audioData = fs.readFileSync(audioPath)

    // Criar exercício com áudio
    const exercise = await prisma.exercise.create({
      data: {
        title: 'Título do Exercício',
        description: 'Descrição do Exercício',
        type: 'LISTENING', // ou outro tipo apropriado
        level: 'BEGINNER', // ou outro nível apropriado
        moduleId: 'ID_DO_MODULO', // substitua pelo ID correto
        audioData: audioData, // Incluindo os dados do áudio
        // ... outros campos necessários
      },
    })

    console.log('Exercício criado com sucesso:', exercise.id)
  } catch (error) {
    console.error('Erro ao criar exercício:', error)
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