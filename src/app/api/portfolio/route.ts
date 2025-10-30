import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { createSupabaseRoute } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { Buffer } from 'node:buffer';

export const runtime = 'nodejs';

const TAG = 'portfolio';
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;
const BUCKET = process.env.NEXT_PUBLIC_BUCKET_PORTFOLIO || 'portfolio';

function ok(body: unknown, init: number | ResponseInit = 200) {
  return NextResponse.json(body, typeof init === 'number' ? { status: init } : init);
}

function toInt(s: string | null | undefined, def: number) {
  if (s == null || s.trim() === '') return def;
  const n = Number(s);
  return Number.isFinite(n) ? n : def;
}
function toBool(v: FormDataEntryValue | null, def = false) {
  if (v === null) return def;
  const s = String(v).toLowerCase().trim();
  return ['true', '1', 'yes', 'on'].includes(s);
}
function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}
function parseTechs(raw: string | null) {
  if (!raw) return [];
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

async function ensureUniqueSlug(base: string) {
  const admin = adminClient();
  let candidate = base;
  let i = 2;
  while (true) {
    const { data, error } = await admin.from('portfolio').select('id').eq('slug', candidate).limit(1);
    if (error) break;
    if (!data || data.length === 0) return candidate;
    candidate = `${base}-${i++}`;
  }
  return candidate;
}

function normalizeKey(key: string | null | undefined) {
  const k = String(key || '').replace(/^\/+/, '');
  // hapus prefix 'portfolio/' atau 'portofolio/' jika ada pada data lama
  return k.replace(/^(portfolio|portofolio)\//, '');
}
function buildCoverUrl(key: string | null | undefined) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const k = normalizeKey(key);
  return k ? `${base}/storage/v1/object/public/${BUCKET}/${k}` : null;
}

// GET /api/portfolio
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q')?.trim() ?? '';
  const featured = url.searchParams.get('featured');
  const year = url.searchParams.get('year');
  const includeDrafts = url.searchParams.get('includeDrafts') === 'true';

  const page = Math.max(1, toInt(url.searchParams.get('page'), DEFAULT_PAGE));
  const limit = Math.min(Math.max(1, toInt(url.searchParams.get('limit'), DEFAULT_LIMIT)), MAX_LIMIT);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const supabase = createSupabaseRoute();

  // Admin + includeDrafts → ambil semua dengan service_role
  if (includeDrafts && (await isAdmin())) {
    const admin = adminClient();
    let qy = admin
      .from('portfolio')
      .select('*', { count: 'exact' })
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (q) qy = qy.ilike('title', `%${q}%`);
    if (featured) qy = qy.eq('featured', featured === 'true');
    if (year) qy = qy.eq('year', Number(year));

    const { data, error, count } = await qy;
    if (error) return ok({ error: error.message }, 500);

    const mapped = (data ?? []).map((r: any) => ({
      ...r,
      cover_url: buildCoverUrl(r.cover_path),
    }));

    return ok({ data: mapped, meta: { page, limit, total: count ?? 0 } }, 200);
  }

  // Publik → hanya published
  let qy = supabase
    .from('portfolio')
    .select('*', { count: 'exact' })
    .eq('published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (q) qy = qy.ilike('title', `%${q}%`);
  if (featured) qy = qy.eq('featured', featured === 'true');
  if (year) qy = qy.eq('year', Number(year));

  const { data, error, count } = await qy;
  if (error) return ok({ error: error.message }, 500);

  const mapped = (data ?? []).map((r: any) => ({
    ...r,
    cover_url: buildCoverUrl(r.cover_path),
  }));

  return ok(
    { data: mapped, meta: { page, limit, total: count ?? 0 } },
    { status: 200, headers: { 'Cache-Tag': TAG } },
  );
}

// POST /api/portfolio (multipart/form-data) — hanya admin, pakai service_role
export async function POST(req: Request) {
  if (!(await isAdmin())) return ok({ error: 'Unauthorized' }, 401);

  const form = await req.formData();
  const title = String(form.get('title') ?? '').trim();
  const description = String(form.get('description') ?? '').trim();
  const techsRaw = String(form.get('techs') ?? '');
  const repo_url = String(form.get('repo_url') ?? '').trim() || null;
  const demo_url = String(form.get('demo_url') ?? '').trim() || null;
  const yearStr = String(form.get('year') ?? '').trim();
  const featured = toBool(form.get('featured'), false);
  const published = toBool(form.get('published'), false);
  const file = form.get('file') as File | null;

  if (!title || !description) return ok({ error: 'title/description required' }, 400);
  if (!yearStr || !/^\d{4}$/.test(yearStr)) return ok({ error: 'invalid year' }, 400);
  const year = Number(yearStr);
  if (year < 1990 || year > 2100) return ok({ error: 'year out of range' }, 400);
  if (!file) return ok({ error: 'file required' }, 400);
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) return ok({ error: 'invalid file type' }, 400);
  if (file.size > 5 * 1024 * 1024) return ok({ error: 'file too large (max 5MB)' }, 400);

  const admin = adminClient();
  const id = crypto.randomUUID();
  const slug = await ensureUniqueSlug(slugify(title));
  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';

  // Simpan sebagai objectKey murni (tanpa nama bucket)
  const objectKey = `${id}/cover.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const up = await admin.storage.from(BUCKET).upload(objectKey, buffer, {
    contentType: file.type,
    upsert: true,
    cacheControl: '31536000',
  });
  if (up.error) return ok({ error: up.error.message }, 500);

  const payload = {
    id,
    slug,
    title,
    description,
    cover_path: objectKey, // simpan objectKey
    techs: parseTechs(techsRaw),
    repo_url,
    demo_url,
    year,
    featured,
    published,
    published_at: published ? new Date().toISOString() : null,
  };

  const { data, error } = await admin.from('portfolio').insert(payload).select().single();
  if (error) return ok({ error: error.message }, 500);

  try {
    revalidateTag(TAG);
  } catch {}

  // tambahkan cover_url untuk kenyamanan
  const dataWithUrl = data ? { ...data, cover_url: buildCoverUrl(data.cover_path) } : data;

  return ok({ data: dataWithUrl }, 201);
}