'use client'

import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function NewStudentPage() {
  const router = useRouter()
  const { register, handleSubmit } = useForm()

  const onSubmit = async (data) => {
    try {
      // Implementar criação do aluno
      console.log(data)
      router.push('/dashboard/students')
    } catch (error) {
      console.error('Erro ao criar aluno:', error)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </button>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Novo Aluno</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nome
                </label>
                <input
                  {...register('name')}
                  type="text"
                  required
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  {...register('email')}
                  type="email"
                  required
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Senha
                </label>
                <input
                  {...register('password')}
                  type="password"
                  required
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nível
                </label>
                <select {...register('level')} className="input">
                  <option value="basic">Básico</option>
                  <option value="intermediate">Intermediário</option>
                  <option value="advanced">Avançado</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="btn-primary">
                Criar Aluno
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
} 