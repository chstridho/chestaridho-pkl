import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { createSupabaseRoute } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { Buffer } from 'node:buffer';

export const runtime = 'nodejs';

const TAG = 'portfolio';
const BUCKET = process.env.NEXT_PUBLIC_BUCKET_PORTFOLIO || 'portfolio';

function ok(body: unknown, init: number | ResponseInit = 200) {
  return NextResponse.json(body, typeof init === 'number' ? { status: init } : init);
}
function isUUID(id: string) {
  return /^[0-9a-fA-F-]{36}$/.test(id);
}
function toBool(v: FormDataEntryValue | null) {
  if (v === null) return undefined;
  const s = String(v).toLowerCase().trim();
  if (['true', '1', 'yes', 'on'].includes(s)) return true;
  if (['false', '0', 'no', 'off'].includes(s)) return false;
  return undefined;
}
function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}
function parseTechsMaybe(raw: string | null) {
  if (raw == null) return undefined;
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}
function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createAdminClient(url, service, { auth: { persistSession: false } });
}
async function isAdmin() {
  const supabase = createSupabaseRoute();
  const { data: { user } } = await supabase.auth.getUser();
  const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();
  return !!user && user.email?.toLowerCase() === adminEmail;
}

function normalizeKey(key: string | null | undefined) {
  const k = String(key || '').replace(/^\/+/, '');
  return k.replace(/^(portfolio|portofolio)\//, '');
}
function buildCoverUrl(key: string | null | undefined) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const k = normalizeKey(key);
  return k ? `${base}/storage/v1/object/public/${BUCKET}/${k}` : null;
}

// GET detail: publik hanya lihat published; admin bisa lihat semua
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const idOrSlug = params.id;
  const supabase = createSupabaseRoute();
  const by = isUUID(idOrSlug) ? { col: 'id', val: idOrSlug } : { col: 'slug', val: idOrSlug };

  if (await isAdmin()) {
    const admin = adminClient();
    const { data, error } = await admin.from('portfolio').select('*').eq(by.col, by.val).maybeSingle();
    if (error) return ok({ error: error.message }, 500);
    if (!data) return ok({ error: 'Not found' }, 404);
    return ok({ data: { ...data, cover_url: buildCoverUrl((data as any).cover_path) } });
  }

  const { data, error } = await supabase
    .from('portfolio')
    .select('*')
    .eq(by.col, by.val)
    .eq('published', true)
    .maybeSingle();

  if (error) return ok({ error: error.message }, 500);
  if (!data) return ok({ error: 'Not found' }, 404);
  return ok({ data: { ...data, cover_url: buildCoverUrl((data as any).cover_path) } });
}

// PATCH (multipart) — admin only
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return ok({ error: 'Unauthorized' }, 401);

  const id = params.id;
  if (!isUUID(id)) return ok({ error: 'Invalid id' }, 400);

  const admin = adminClient();
  const form = await req.formData();
  const title = form.get('title') as string | null;
  const description = form.get('description') as string | null;
  const techsRaw = form.get('techs') as string | null;
  const repo_url = (form.get('repo_url') as string | null) ?? undefined;
  const demo_url = (form.get('demo_url') as string | null) ?? undefined;
  const yearStr = (form.get('year') as string | null) ?? undefined;
  const featured = toBool(form.get('featured'));
  const published = toBool(form.get('published'));
  const file = form.get('file') as File | null;

  const { data: current, error: curErr } = await admin
    .from('portfolio')
    .select('slug, cover_path')
    .eq('id', id)
    .single();
  if (curErr || !current) return ok({ error: 'Not found' }, 404);

  const patch: Record<string, any> = {};
  if (title && title.trim()) {
    patch.title = title.trim();
    patch.slug = slugify(title.trim());
  }
  if (description != null) patch.description = description.trim();
  const techs = parseTechsMaybe(techsRaw);
  if (techs !== undefined) patch.techs = techs;
  if (repo_url !== undefined) patch.repo_url = repo_url || null;
  if (demo_url !== undefined) patch.demo_url = demo_url || null;
  if (yearStr !== undefined) {
    const y = Number(yearStr);
    if (!Number.isFinite(y) || y < 1990 || y > 2100) return ok({ error: 'invalid year' }, 400);
    patch.year = y;
  }
  if (featured !== undefined) patch.featured = featured;
  if (published !== undefined) {
    patch.published = published;
    patch.published_at = published ? new Date().toISOString() : null;
  }

  if (file) {
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) return ok({ error: 'invalid file type' }, 400);
    if (file.size > 5 * 1024 * 1024) return ok({ error: 'file too large (max 5MB)' }, 400);

    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const newKey = `${id}/cover.${ext}`; // objectKey murni
    const buffer = Buffer.from(await file.arrayBuffer());

    const up = await admin.storage.from(BUCKET).upload(newKey, buffer, {
      contentType: file.type,
      upsert: true,
      cacheControl: '31536000',
    });
    if (up.error) return ok({ error: up.error.message }, 500);

    // Hapus file lama jika beda (normalisasi dulu jika data lama masih ada prefix)
    const oldKey = normalizeKey((current as any).cover_path);
    if (oldKey && oldKey !== newKey) {
      await admin.storage.from(BUCKET).remove([oldKey]);
    }
    patch.cover_path = newKey;
  }

  const { data, error } = await admin
    .from('portfolio')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) return ok({ error: error.message }, 500);

  try {
    revalidateTag(TAG);
  } catch {}

  return ok({ data: { ...data, cover_url: buildCoverUrl((data as any).cover_path) } }, 200);
}

// DELETE — admin only
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return ok({ error: 'Unauthorized' }, 401);

  const id = params.id;
  if (!isUUID(id)) return ok({ error: 'Invalid id' }, 400);

  const admin = adminClient();

  const { data: current } = await admin.from('portfolio').select('cover_path').eq('id', id).single();
  const { error } = await admin.from('portfolio').delete().eq('id', id);
  if (error) return ok({ error: error.message }, 500);

  const oldKey = normalizeKey((current as any)?.cover_path);
  if (oldKey) {
    await admin.storage.from(BUCKET).remove([oldKey]);
  }

  try {
    revalidateTag(TAG);
  } catch {}

  return ok({ success: true }, 200);
}