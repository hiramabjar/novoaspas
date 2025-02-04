'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Language, Level, User } from '@prisma/client'

type Enrollment = {
  languageId: string
  levelId: string
}

const studentSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres').optional(),
  enrollments: z.array(z.object({
    languageId: z.string().min(1, 'Selecione um idioma'),
    levelId: z.string().min(1, 'Selecione um nível')
  })).min(1, 'Adicione pelo menos uma matrícula')
})

type StudentFormData = z.infer<typeof studentSchema>

interface StudentFormProps {
  onSuccess: () => void
  initialData?: User | null
}

export function StudentForm({ onSuccess, initialData }: StudentFormProps) {
  const [languages, setLanguages] = useState<Language[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [enrollments, setEnrollments] = useState<Enrollment[]>(
    initialData?.studentProfile?.enrollments?.map(e => ({
      languageId: e.languageId,
      levelId: e.levelId
    })) || [{ languageId: '', levelId: '' }]
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      email: initialData.email,
      enrollments: initialData.studentProfile?.enrollments?.map(e => ({
        languageId: e.languageId,
        levelId: e.levelId
      })) || [{ languageId: '', levelId: '' }]
    } : {
      enrollments: [{ languageId: '', levelId: '' }]
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

  const onSubmit = async (data: StudentFormData) => {
    try {
      setIsSubmitting(true)
      const response = await fetch('/api/admin/students' + (initialData ? `/${initialData.id}` : ''), {
        method: initialData ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao salvar aluno')
      }

      reset()
      onSuccess()
    } catch (error) {
      console.error('Erro:', error)
      alert(error instanceof Error ? error.message : 'Erro ao salvar aluno')
    } finally {
      setIsSubmitting(false)
    }
  }

  const addEnrollment = () => {
    const newEnrollments = [...enrollments, { languageId: '', levelId: '' }]
    setEnrollments(newEnrollments)
    setValue('enrollments', newEnrollments)
  }

  const removeEnrollment = (index: number) => {
    if (enrollments.length > 1) {
      const newEnrollments = enrollments.filter((_, i) => i !== index)
      setEnrollments(newEnrollments)
      setValue('enrollments', newEnrollments)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nome</label>
        <input
          type="text"
          {...register('name')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          {...register('email')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      {!initialData && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Senha</label>
          <input
            type="password"
            {...register('password')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>
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
                  {...register(`enrollments.${index}.languageId`)}
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
                  {...register(`enrollments.${index}.levelId`)}
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

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  )
} 