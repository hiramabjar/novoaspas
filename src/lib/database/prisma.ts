import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['query'],
    // Configurações de cache do SQLite
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  }).$extends({
    query: {
      exercise: {
        async findUnique({ args, query }) {
          // Cache para consultas de áudio
          if (args.select?.audioData) {
            args.cacheStrategy = 'cache-first'
          }
          return query(args)
        },
      },
    },
  })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma

export default prisma 