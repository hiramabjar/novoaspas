/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['github.com'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
  // Disable static generation
  staticGeneration: false,
  // Force dynamic rendering
  dynamicRendering: true
}

module.exports = nextConfig 