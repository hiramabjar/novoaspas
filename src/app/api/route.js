export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET() {
  return new Response('API is running', { status: 200 })
} 