/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['github.com'],
  },
  // Disable static exports for API routes
  exportPathMap: async function() {
    return {
      '/': { page: '/' },
    }
  }
}

module.exports = nextConfig 