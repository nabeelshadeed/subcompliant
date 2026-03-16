/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    'postgres',
    '@aws-sdk/client-s3',
  ],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'docs.subcompliant.co.uk' },
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: 'img.clerk.com' },
    ],
  },
}

export default nextConfig
