/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  // Vercel 构建兼容
  experimental: {
    esmExternals: 'loose',
  },
};

module.exports = nextConfig;
