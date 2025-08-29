import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['fbcdn.net', '*.fbcdn.net'],
    unoptimized: true,
  },
};

export default nextConfig;
