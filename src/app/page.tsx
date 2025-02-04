import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8">
        Bem-vindo à Escola de Idiomas
      </h1>
      <Link
        href="/auth/login"
        className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
      >
        Acessar Sistema
      </Link>
    </div>
  )
} 