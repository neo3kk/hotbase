/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'izntndbzqbiwssduoxjw.supabase.co',
        port: '',
        // Este pathname permite cualquier ruta dentro del storage
        pathname: '/storage/v1/**',
      },
    ],
  },
};

module.exports = nextConfig;