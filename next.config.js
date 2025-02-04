/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['github.com'],
  },
  experimental: {
    serverActions: true
  }
}

module.exports = nextConfig 