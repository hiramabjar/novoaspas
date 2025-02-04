import { prisma } from '@/lib/database/prisma'

export default async function UsersPage() {
  const users = await prisma.user.findMany()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Usuários Cadastrados</h1>
      <div className="grid gap-4">
        {users.map(user => (
          <div key={user.id} className="bg-white p-4 rounded shadow">
            <p>ID: {user.id}</p>
            <p>Nome: {user.name}</p>
            <p>Email: {user.email}</p>
            <p>Cargo: {user.role}</p>
          </div>
        ))}
      </div>
    </div>
  )
} 