import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseRoute } from '@/lib/supabase/route';

export async function GET(req: NextRequest) {
  // Khusus OAuth / magic link (exchange code → session)
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const supabase = createSupabaseRoute();
  if (code) {
    await (supabase as any).auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(url.origin + '/admin/dashboard');
}

export async function POST(req: NextRequest) {
  // Sinkronisasi cookie session (dipanggil dari client onAuthStateChange)
  const supabase = createSupabaseRoute();
  const { event, session } = await req.json();
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    // @ts-ignore: setSession menerima tokens/session
    await (supabase as any).auth.setSession({
      access_token: session?.access_token,
      refresh_token: session?.refresh_token,
    });
  }
  if (event === 'SIGNED_OUT') {
    await (supabase as any).auth.signOut();
  }
  return NextResponse.json({ ok: true });
}

export const dynamic = 'force-dynamic';