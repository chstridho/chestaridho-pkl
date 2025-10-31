// Server Component (jangan pakai "use client")
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import AdminLoginClient from './_client';

export default function Page() {
  return <AdminLoginClient />;
}