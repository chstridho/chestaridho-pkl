import type { ReactNode } from 'react';
import Navbar from '@/components/sections/Navbar';
import SiteFooter from '@/components/sections/SiteFooter';

export default function ViewerGroupLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}