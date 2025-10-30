import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;
  const isAdminArea = pathname.startsWith('/admin');
  const isLogin = pathname.startsWith('/admin/login');

  if (!isAdminArea) return res;

  if (!session && !isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.searchParams.set('next', pathname + (req.nextUrl.search || ''));
    return NextResponse.redirect(url);
  }

  if (session && isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/dashboard';
    url.searchParams.delete('next');
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = { matcher: ['/admin/:path*'] };