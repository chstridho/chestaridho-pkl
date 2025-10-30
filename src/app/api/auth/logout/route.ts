import { NextResponse } from 'next/server';
import { createSupabaseRoute } from '@/lib/supabase/route';

export async function POST() {
  const supabase = createSupabaseRoute();
  try {
    // @ts-ignore
    await (supabase as any).auth.signOut();
  } catch {}
  return NextResponse.json({ ok: true });
}

export const dynamic = 'force-dynamic';


