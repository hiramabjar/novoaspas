'use client'

import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useForm } from 'react-hook-form'
import { StudentForm } from '@/components/students/StudentForm'

interface StudentFormData {
  name: string
  email: string
  password?: string
  enrollments: Array<{
    languageId: string
    levelId: string
  }>
}

export default function NewStudentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const form = useForm<StudentFormData>()

  const onSubmit = async (data: StudentFormData) => {
    try {
      const response = await fetch('/api/admin/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Failed to create student')
      }

      toast({
        title: 'Success',
        description: 'Student created successfully'
      })

      router.push('/admin/students')
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create student',
        variant: 'destructive'
      })
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

          <StudentForm onSubmit={onSubmit} />
        </div>
      </div>
    </DashboardLayout>
  )
} 