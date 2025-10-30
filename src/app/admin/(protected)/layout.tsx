import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Server-side guard untuk semua halaman di dalam (protected)
export default async function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    // Tambahkan next agar kembali ke halaman yang diminta setelah login
    redirect('/admin/login');
  }

  return <>{children}</>;
}