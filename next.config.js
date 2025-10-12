/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.mapbox.com',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['framer-motion', '@tanstack/react-query'],
  },
  // CloudKit configuration
  env: {
    NEXT_PUBLIC_CLOUDKIT_CONTAINER_ID: process.env.NEXT_PUBLIC_CLOUDKIT_CONTAINER_ID,
    NEXT_PUBLIC_CLOUDKIT_API_TOKEN: process.env.NEXT_PUBLIC_CLOUDKIT_API_TOKEN,
    NEXT_PUBLIC_CLOUDKIT_ENVIRONMENT: process.env.NEXT_PUBLIC_CLOUDKIT_ENVIRONMENT || 'development',
  },
};

module.exports = nextConfig;
