'use client'

import { useState, useEffect } from 'react'
import { useForm, FieldValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Language, Level, User } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Controller } from 'react-hook-form'

interface StudentProfile {
  id: string
  userId: string
  enrollments: Array<{
    languageId: string
    levelId: string
  }>
}

interface UserWithProfile extends User {
  studentProfile?: StudentProfile | null
}

const studentSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  password: z.string().optional(),
  enrollments: z.array(z.object({
    languageId: z.string(),
    levelId: z.string()
  }))
})

type StudentFormData = z.infer<typeof studentSchema>

interface StudentFormProps {
  initialData?: UserWithProfile
  onSubmit: (data: StudentFormData) => Promise<void>
}

interface FormField {
  onChange: (value: string) => void
  onBlur: () => void
  value: string
  name: string
  ref: React.Ref<HTMLInputElement>
}

export function StudentForm({ initialData, onSubmit }: StudentFormProps) {
  const [languages, setLanguages] = useState<Language[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [enrollments, setEnrollments] = useState<{ languageId: string; levelId: string }[]>(
    initialData?.studentProfile?.enrollments?.map(e => ({
      languageId: e.languageId,
      levelId: e.levelId
    })) || [{ languageId: '', levelId: '' }]
  )

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: initialData ? {
      name: initialData.name || '',
      email: initialData.email || '',
      enrollments: initialData.studentProfile?.enrollments?.map((e) => ({
        languageId: e.languageId,
        levelId: e.levelId
      })) || []
    } : {
      name: '',
      email: '',
      enrollments: []
    }
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [languagesRes, levelsRes] = await Promise.all([
        fetch('/api/admin/languages'),
        fetch('/api/admin/levels')
      ])
      
      const languagesData = await languagesRes.json()
      const levelsData = await levelsRes.json()
      
      setLanguages(languagesData)
      setLevels(levelsData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  const handleSubmit = async (data: StudentFormData) => {
    try {
      setIsSubmitting(true)
      await onSubmit(data)
      form.reset()
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addEnrollment = () => {
    const newEnrollments = [...enrollments, { languageId: '', levelId: '' }]
    setEnrollments(newEnrollments)
    form.setValue('enrollments', newEnrollments)
  }

  const removeEnrollment = (index: number) => {
    if (enrollments.length > 1) {
      const newEnrollments = enrollments.filter((_, i) => i !== index)
      setEnrollments(newEnrollments)
      form.setValue('enrollments', newEnrollments)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }: { field: FormField }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }: { field: FormField }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="email"
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!initialData && (
          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="password"
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage>{fieldState.error?.message}</FormMessage>
              </FormItem>
            )}
          />
        )}

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Matrículas</h3>
            <button
              type="button"
              onClick={addEnrollment}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              + Adicionar Matrícula
            </button>
          </div>

          {enrollments.map((enrollment, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="flex justify-between mb-4">
                <h4 className="font-medium">Matrícula {index + 1}</h4>
                {enrollments.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEnrollment(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remover
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Idioma
                  </label>
                  <select
                    {...form.register(`enrollments.${index}.languageId`)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  >
                    <option value="">Selecione um idioma</option>
                    {languages.map((language) => (
                      <option key={language.id} value={language.id}>
                        {language.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nível
                  </label>
                  <select
                    {...form.register(`enrollments.${index}.levelId`)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  >
                    <option value="">Selecione um nível</option>
                    {levels.map((level) => (
                      <option key={level.id} value={level.id}>
                        {level.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </Button>
      </form>
    </Form>
  )
} 