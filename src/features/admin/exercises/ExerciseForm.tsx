import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ExerciseFormData, ExerciseWithRelations } from '@/types/exercise'

const exerciseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  type: z.enum(['reading', 'listening', 'dictation']),
  languageId: z.string().min(1, 'Language is required'),
  levelId: z.string().min(1, 'Level is required'),
  moduleId: z.string().optional(),
  questions: z.array(z.object({
    question: z.string().min(1, 'Question is required'),
    options: z.array(z.string()),
    correctAnswer: z.string().min(1, 'Correct answer is required')
  }))
})

interface ExerciseFormProps {
  initialData?: ExerciseWithRelations
  onSubmit: (data: ExerciseFormData) => Promise<void>
}

export function ExerciseForm({ initialData, onSubmit }: ExerciseFormProps) {
  const form = useForm<ExerciseFormData>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: initialData ? {
      title: initialData.title,
      description: initialData.description,
      content: initialData.content,
      type: initialData.type as 'reading' | 'listening' | 'dictation',
      languageId: initialData.languageId,
      levelId: initialData.levelId,
      moduleId: initialData.moduleId || undefined,
      questions: initialData.questions.map(q => ({
        question: q.question,
        options: q.options ? q.options.split(',') : [],
        correctAnswer: q.correctAnswer
      }))
    } : {
      title: '',
      description: '',
      content: '',
      type: 'reading',
      languageId: '',
      levelId: '',
      questions: []
    }
  })

  const handleAddQuestion = () => {
    const currentQuestions = form.getValues('questions') || []
    form.setValue('questions', [
      ...currentQuestions,
      { question: '', options: [], correctAnswer: '' }
    ])
  }

  const handleRemoveQuestion = (index: number) => {
    const currentQuestions = form.getValues('questions')
    form.setValue('questions', currentQuestions.filter((_, i) => i !== index))
  }

  const handleAddOption = (questionIndex: number) => {
    const currentQuestions = form.getValues('questions')
    const currentOptions = currentQuestions[questionIndex].options || []
    const updatedQuestions = [...currentQuestions]
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      options: [...currentOptions, '']
    }
    form.setValue('questions', updatedQuestions)
  }

  const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
    const currentQuestions = form.getValues('questions')
    const updatedQuestions = [...currentQuestions]
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      options: updatedQuestions[questionIndex].options.filter((_, i) => i !== optionIndex)
    }
    form.setValue('questions', updatedQuestions)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Input
            {...form.register('title')}
            placeholder="Exercise Title"
            className="w-full"
          />
          {form.formState.errors.title && (
            <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
          )}
        </div>

        <div className="space-y-4">
          <Select
            onValueChange={(value) => form.setValue('type', value as 'reading' | 'listening' | 'dictation')}
            defaultValue={form.getValues('type')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Exercise Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="reading">Reading</SelectItem>
              <SelectItem value="listening">Listening</SelectItem>
              <SelectItem value="dictation">Dictation</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.type && (
            <p className="text-sm text-red-500">{form.formState.errors.type.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <Textarea
          {...form.register('description')}
          placeholder="Exercise Description"
          className="w-full"
          rows={3}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
        )}
      </div>

      <div className="space-y-4">
        <Textarea
          {...form.register('content')}
          placeholder="Exercise Content"
          className="w-full"
          rows={6}
        />
        {form.formState.errors.content && (
          <p className="text-sm text-red-500">{form.formState.errors.content.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Input
            {...form.register('languageId')}
            placeholder="Language ID"
            className="w-full"
          />
          {form.formState.errors.languageId && (
            <p className="text-sm text-red-500">{form.formState.errors.languageId.message}</p>
          )}
        </div>

        <div className="space-y-4">
          <Input
            {...form.register('levelId')}
            placeholder="Level ID"
            className="w-full"
          />
          {form.formState.errors.levelId && (
            <p className="text-sm text-red-500">{form.formState.errors.levelId.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Questions</h3>
          <Button type="button" onClick={handleAddQuestion}>
            Add Question
          </Button>
        </div>

        {form.watch('questions')?.map((_, questionIndex) => (
          <div key={questionIndex} className="space-y-4 p-4 border rounded-lg">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Question {questionIndex + 1}</h4>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => handleRemoveQuestion(questionIndex)}
              >
                Remove
              </Button>
            </div>

            <Input
              {...form.register(`questions.${questionIndex}.question`)}
              placeholder="Question text"
              className="w-full"
            />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h5 className="font-medium">Options</h5>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleAddOption(questionIndex)}
                >
                  Add Option
                </Button>
              </div>

              {form.watch(`questions.${questionIndex}.options`)?.map((_, optionIndex) => (
                <div key={optionIndex} className="flex gap-2">
                  <Input
                    {...form.register(`questions.${questionIndex}.options.${optionIndex}`)}
                    placeholder={`Option ${optionIndex + 1}`}
                    className="w-full"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveOption(questionIndex, optionIndex)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>

            <Input
              {...form.register(`questions.${questionIndex}.correctAnswer`)}
              placeholder="Correct answer"
              className="w-full"
            />
          </div>
        ))}
      </div>

      <Button type="submit" className="w-full">
        {initialData ? 'Update' : 'Create'} Exercise
      </Button>
    </form>
  )
} 