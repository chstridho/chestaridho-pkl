// next.config.ts
import type { NextConfig } from 'next';
const host = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).host;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: host, pathname: '/storage/v1/object/public/**' },
    ],
  },
};
export default nextConfig;