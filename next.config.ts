import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['www.instagram.com', 'instagram.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.instagram.com',
      },
    ],
  },
};

export default nextConfig;