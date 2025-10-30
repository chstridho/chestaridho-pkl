// src/app/api/debug/me/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseRoute } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createSupabaseRoute();
  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = !!user && user.email?.toLowerCase() === (process.env.ADMIN_EMAIL || '').toLowerCase();
  return NextResponse.json({ user: user ? { id: user.id, email: user.email } : null, isAdmin });
}