/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['github.com'],
  },
  // Disable static generation for API routes and dynamic pages
  generateStaticParams: async () => {
    return []
  },
  // Force dynamic rendering for specific routes
  unstable_runtimeJS: true,
  unstable_allowDynamic: [
    '/api/**',
    '/admin/**',
    '/dashboard/**'
  ]
}

module.exports = nextConfig 