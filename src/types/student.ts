import { User, StudentProfile, Enrollment, Language, Level } from '@prisma/client'

export interface StudentWithProfile extends User {
  studentProfile: StudentProfile & {
    enrollments: (Enrollment & {
      language: Language
      level: Level
    })[]
  }
}

export interface EnrollmentWithRelations extends Enrollment {
  language: Language
  level: Level
}

export interface StudentProfileWithRelations extends StudentProfile {
  enrollments: EnrollmentWithRelations[]
  user: User
}

export type StudentFormData = {
  name: string
  email: string
  password?: string
  enrollments: {
    languageId: string
    levelId: string
  }[]
} 