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
      'scontent-iad3-1.cdninstagram.com',
      'scontent-iad3-2.cdninstagram.com',
      'scontent-iad3-1.xx.fbcdn.net',
      'scontent-iad3-2.xx.fbcdn.net',
      'scontent-dfw5-1.cdninstagram.com',
      'scontent-dfw5-2.cdninstagram.com',
      'scontent-lga3-1.cdninstagram.com',
      'scontent-lga3-2.cdninstagram.com',
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
      'platform-lookaside.fbsbx.com',
      'scontent-mad1-1.xx.fbcdn.net'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.instagram.com',
      },
      {
        protocol: 'https',
        hostname: '*.cdninstagram.com',
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
      {
        protocol: 'https',
        hostname: '**.fbcdn.net',
      },
    ],
  },
  output: 'standalone',
};

module.exports = nextConfig; 