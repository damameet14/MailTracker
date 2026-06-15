import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@mailtracker/shared'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; connect-src 'self' https://*.googleapis.com https://securetoken.googleapis.com; frame-src https://accounts.google.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' https://accounts.google.com",
          },
        ],
      },
    ]
  },
}

export default nextConfig
