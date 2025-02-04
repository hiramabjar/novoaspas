import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const exerciseSchema = z.object({
  type: z.enum(['READING', 'GRAMMAR', 'LISTENING', 'DICTATION']),
  language: z.enum(['EN', 'ES', 'DE', 'IT', 'FR']),
  level: z.string(),
  content: z.string().min(10),
  questions: z.array(z.object({
    question: z.string(),
    options: z.array(z.string()),
    correctAnswer: z.string()
  })).optional(),
  audioUrl: z.string().optional()
})

type ExerciseFormProps = {
  initialData?: Exercise
  onSubmit: (values: z.infer<typeof exerciseSchema>) => Promise<void>
}

export function ExerciseForm({ initialData, onSubmit }: ExerciseFormProps) {
  const form = useForm<z.infer<typeof exerciseSchema>>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: initialData || {
      type: 'READING',
      language: 'EN',
      level: 'A1',
      content: '',
      questions: []
    }
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select onValueChange={form.setValue} defaultValue={form.watch('type')}>
          <SelectTrigger>
            <SelectValue placeholder="Tipo de Exercício" />
          </SelectTrigger>
          <SelectContent>
            {['READING', 'GRAMMAR', 'LISTENING', 'DICTATION'].map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={form.setValue} defaultValue={form.watch('language')}>
          <SelectTrigger>
            <SelectValue placeholder="Idioma" />
          </SelectTrigger>
          <SelectContent>
            {['EN', 'ES', 'DE', 'IT', 'FR'].map(lang => (
              <SelectItem key={lang} value={lang}>{lang}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input {...form.register('level')} placeholder="Nível (ex: A1, B2)" />
        
        {form.watch('type') === 'DICTATION' && (
          <Input 
            type="file" 
            accept="audio/*"
            onChange={(e) => handleAudioUpload(e.target.files)}
          />
        )}
      </div>

      <Textarea
        {...form.register('content')}
        placeholder="Conteúdo do exercício"
        rows={6}
      />

      {form.watch('type') === 'GRAMMAR' && (
        <div className="space-y-4">
          {form.watch('questions')?.map((_, index) => (
            <div key={index} className="border p-4 rounded">
              <Input {...form.register(`questions.${index}.question`)} />
              {/* Campos para opções e resposta correta */}
            </div>
          ))}
          <Button type="button" onClick={() => form.setValue('questions', [...form.watch('questions')!, { question: '', options: [], correctAnswer: '' }])}>
            Adicionar Questão
          </Button>
        </div>
      )}

      <Button type="submit" className="w-full">
        {initialData ? 'Atualizar' : 'Criar'} Exercício
      </Button>
    </form>
  )
} 