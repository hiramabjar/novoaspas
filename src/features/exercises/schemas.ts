import { z } from 'zod'

export const exerciseSchema = z.object({
  title: z.string(),
  description: z.string(),
  content: z.string(),
  type: z.string(),
  moduleId: z.string(),
  languageId: z.string(),
  levelId: z.string()
}) 