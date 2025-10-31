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

// Bangun base URL absolut dari request (aman dev/production)
async function getBaseUrl() {
  const h = await headers(); // ✅ pakai await
  const proto = h.get('x-forwarded-proto') ?? 'http';
  const host = h.get('x-forwarded-host') ?? h.get('host');
  const envBase = process.env.NEXT_PUBLIC_BASE_URL;
  return envBase || `${proto}://${host}`;
}

async function getProjects(): Promise<UIProject[]> {
  const base = await getBaseUrl(); // ✅ panggil dengan await
  const res = await fetch(`${base}/api/portfolio?limit=24`, {
    next: { tags: ['portfolio'] },
  });
  if (!res.ok) return [];
  const j = await res.json();
  const rows = (j.data ?? []) as DBRow[];

  // Map dari API → shape yang dipakai ProjectsSection
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

// Server Component: SSR + terhubung revalidateTag('portfolio')
export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <ProjectsSection
      projects={projects}
      subtitle="Beberapa karya yang saya buat — interaktif dan terus bertambah."
    />
  );
}
