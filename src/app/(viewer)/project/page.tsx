export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import ProjectsSection, { type Project as UIProject } from '@/components/sections/ProjectsSection';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

// BUCKET + helper URL publik (robust untuk key lama/baru)
const BUCKET = process.env.NEXT_PUBLIC_BUCKET_PORTFOLIO || 'portfolio';
function normalizeKey(key: string | null | undefined) {
  const k = String(key || '').replace(/^\/+/, '');
  return k.replace(/^(portfolio|portofolio)\//, '');
}
function buildCoverUrl(key: string | null | undefined) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const k = normalizeKey(key);
  return k ? `${base}/storage/v1/object/public/${BUCKET}/${k}` : '';
}

type DBRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_path: string | null;
  techs: string[] | null;
  repo_url: string | null;
  demo_url: string | null;
  year: number | null;
};

async function getProjectsFromDB(): Promise<UIProject[]> {
  const supabase = createServerComponentClient({ cookies });

  // Ambil hanya yang published (RLS publik akan enforce juga)
  const { data, error } = await supabase
    .from('portfolio')
    .select('id, slug, title, description, cover_path, techs, repo_url, demo_url, year, sort_order, created_at')
    .eq('published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return (data as DBRow[]).map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description ?? '',
    image: buildCoverUrl(r.cover_path), // untuk next/image di ProjectsSection
    href: `/project/${r.slug}`,         // navigasi ke detail
    repo: r.repo_url ?? undefined,
    demo: r.demo_url ?? undefined,
    langs: r.techs ?? undefined,
    year: r.year ?? undefined,
  }));
}

export default async function ProjectsPage() {
  let projects: UIProject[] = [];
  try {
    projects = await getProjectsFromDB();
  } catch {
    projects = [];
  }

  return (
    <ProjectsSection
      projects={projects}
      subtitle="Beberapa karya yang saya buat — interaktif dan terus bertambah."
    />
  );
}