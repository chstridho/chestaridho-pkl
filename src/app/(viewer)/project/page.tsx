import ProjectsSection, { type Project as UIProject } from '@/components/sections/ProjectsSection';
import { headers } from 'next/headers';

type DBRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_url: string | null;  // sudah dikirim API
  techs: string[] | null;
  repo_url: string | null;
  demo_url: string | null;
  year: number | null;
};

// Bangun base URL absolut dari request (aman dev/production)
function getBaseUrl() {
  const h = headers();
  const proto = h.get('x-forwarded-proto') ?? 'http';
  const host = h.get('x-forwarded-host') ?? h.get('host');
  const envBase = process.env.NEXT_PUBLIC_BASE_URL;
  return envBase || `${proto}://${host}`;
}

async function getProjects(): Promise<UIProject[]> {
  const base = getBaseUrl();
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
    image: r.cover_url ?? '',        // langsung pakai cover_url dari API
    href: `/project/${r.slug}`,      // navigasi ke halaman detail
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