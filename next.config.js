/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    domains: 
    [
      'scontent.cdninstagram.com',
      'scontent-mad1-1.cdninstagram.com',
      'scontent-mad1-2.cdninstagram.com',
      'scontent-mad2-1.cdninstagram.com',
      'scontent-mad2-2.cdninstagram.com',
      'scontent.cdninstagram.com',
      'instagram.com',
      'www.instagram.com',
      'graph.instagram.com',
      'i.instagram.com',
      'cdninstagram.com',
      'www.instagram.com', 
      'instagram.com',
      'ggrjdxfnoqnqsohqmalh.supabase.co'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.instagram.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  output: 'standalone',
  // Configuración para desarrollo HTTPS
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: 'https://127.0.0.1:3001/:path*',
      },
    ];
  },
};

module.exports = nextConfig; 