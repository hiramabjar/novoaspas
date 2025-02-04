export const LANGUAGES = [
  {
    id: 'en',
    name: 'Inglês',
    code: 'en-US'
  },
  { id: 'es', name: 'Espanhol', code: 'es-ES' },
  { id: 'de', name: 'Alemão', code: 'de-DE' },
  { id: 'it', name: 'Italiano', code: 'it-IT' },
  { id: 'fr', name: 'Francês', code: 'fr-FR' }
] as const

export const LEVELS = [
  {
    id: 'beginner',
    name: 'Iniciante'
  },
  {
    id: 'intermediate',
    name: 'Intermediário'
  },
  {
    id: 'advanced',
    name: 'Avançado'
  }
] as const

export const MODULES = {
  READING: 'reading-module',
  LISTENING: 'listening-module'
} as const 