'use client'

import { useState, useEffect } from 'react'
import { StudentForm } from '@/components/students/StudentForm'
import { User, StudentProfile, Enrollment, Language, Level } from '@prisma/client'

type UserWithProfile = User & {
  studentProfile?: StudentProfile & {
    enrollments: (Enrollment & {
      language: Language
      level: Level
    })[]
  }
}

export default function StudentsPage() {
  const [students, setStudents] = useState<UserWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingStudent, setEditingStudent] = useState<User | null>(null)

  useEffect(() => {
    loadStudents()
  }, [])

  async function loadStudents() {
    try {
      const response = await fetch('/api/admin/students')
      const data = await response.json()
      setStudents(data.students || [])
    } catch (error) {
      console.error('Erro ao carregar alunos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (student: UserWithProfile) => {
    setEditingStudent(student)
    setShowForm(true)
  }

  const handleSuccess = () => {
    setShowForm(false)
    setEditingStudent(null)
    loadStudents()
  }

  if (loading) {
    return <div>Carregando alunos...</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Alunos</h1>
        <button
          onClick={() => {
            setEditingStudent(null)
            setShowForm(true)
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Novo Aluno
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingStudent ? 'Editar Aluno' : 'Cadastrar Novo Aluno'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditingStudent(null)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <StudentForm onSuccess={handleSuccess} initialData={editingStudent} />
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {students.map((student) => (
          <div
            key={student.id}
            className="bg-white p-4 rounded-lg shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">{student.name}</h2>
                <p className="text-gray-600">{student.email}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {student.studentProfile?.enrollments.map((enrollment) => (
                    <span
                      key={enrollment.id}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                    >
                      {enrollment.language.name} - {enrollment.level.name}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => handleEdit(student)}
                className="text-blue-600 hover:text-blue-700"
              >
                Editar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 