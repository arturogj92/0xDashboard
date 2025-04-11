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
      'ggrjdxfnoqnqsohqmalh.supabase.co',
      'lh3.googleusercontent.com',
      'platform-lookaside.fbsbx.com'
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
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'platform-lookaside.fbsbx.com',
      },
    ],
  },
  output: 'standalone',
};

module.exports = nextConfig; 