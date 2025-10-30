// next.config.ts
import type { NextConfig } from 'next';

const getSupabaseHost = (): string => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  if (!url) {
    console.warn('NEXT_PUBLIC_SUPABASE_URL is not defined');
    return '';
  }
  
  try {
    return new URL(url).host;
  } catch (error) {
    console.warn('Invalid NEXT_PUBLIC_SUPABASE_URL:', url);
    return '';
  }
};

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { 
        protocol: 'https', 
        hostname: getSupabaseHost(),
        pathname: '/storage/v1/object/public/**' 
      },
    ],
  },
};

export default nextConfig;