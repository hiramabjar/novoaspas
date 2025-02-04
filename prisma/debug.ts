import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function checkModules() {
  const modules = await prisma.module.findMany()
  console.log('Existing modules:', modules)
}

checkModules()
  .catch(console.error)
  .finally(() => prisma.$disconnect()) 