import ProjectsSection, { type Project as UIProject } from '@/components/sections/ProjectsSection';
import { headers } from 'next/headers';

type DBRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  techs: string[] | null;
  repo_url: string | null;
  demo_url: string | null;
  year: number | null;
};

async function getBaseUrl() {
  const envBase =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '');
  if (envBase) return envBase;
  const h = await headers();
  const proto = h.get('x-forwarded-proto') ?? 'http';
  const host = h.get('x-forwarded-host') ?? h.get('host');
  return `${proto}://${host}`;
}

async function getProjects(): Promise<UIProject[]> {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/portfolio?limit=24`, { next: { tags: ['portfolio'] } });
  if (!res.ok) return [];
  const j = await res.json();
  const rows = (j.data ?? []) as DBRow[];
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description ?? '',
    image: r.cover_url ?? '',
    href: `/project/${r.slug}`,
    repo: r.repo_url ?? undefined,
    demo: r.demo_url ?? undefined,
    langs: r.techs ?? undefined,
    year: r.year ?? undefined,
  }));
}

export default async function ProjectsPage() {
  const projects = await getProjects();
  return <ProjectsSection projects={projects} subtitle="Beberapa karya yang saya buat — interaktif dan terus bertambah." />;
}