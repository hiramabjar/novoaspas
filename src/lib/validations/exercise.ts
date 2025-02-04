import { z } from 'zod'

export const questionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'O enunciado é obrigatório'),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().min(1, 'A resposta correta é obrigatória'),
  audioUrl: z.string().optional()
})

export const exerciseSchema = z.object({
  title: z.string().min(3, 'O título deve ter pelo menos 3 caracteres'),
  description: z.string().min(10, 'A descrição deve ter pelo menos 10 caracteres'),
  level: z.enum(['basic', 'intermediate', 'advanced']),
  type: z.enum(['multiple_choice', 'dictation', 'writing']),
  questions: z.array(questionSchema).min(1, 'Adicione pelo menos uma questão')
})

export type ExerciseFormData = z.infer<typeof exerciseSchema> 