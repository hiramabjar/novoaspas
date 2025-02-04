/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['github.com'],
  },
  // Disable static generation
  staticPageGenerationTimeout: 1000,
  experimental: {
    // Enable streaming
    serverActions: {
      bodySizeLimit: '2mb'
    },
    // Prevent static generation
    isrMemoryCacheSize: 0,
    workerThreads: false,
    cpus: 1
  }
}

module.exports = nextConfig 