export enum UserRole {
  ADMIN = 'admin',
  STUDENT = 'student'
}

export type User = {
  id: number
  name: string
  email: string
  password: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
  // ... outros campos
} 