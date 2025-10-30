'use client';

import Image from 'next/image';
import { Anton, Manrope } from 'next/font/google';
import { useEffect, useMemo, useState } from 'react';
import ScrollReveal from '@/components/motion/ScrollReveal';

const anton = Anton({ weight: '400', subsets: ['latin'] });
const manrope = Manrope({ subsets: ['latin'] });

// Tipe untuk UI komponen ini
export type Project = {
  id: string;
  title: string;
  description: string;
  image: string;         // full URL (pakai cover_url dari API)
  href?: string;         // optional link ke halaman detail /project/[slug]
  repo?: string;         // optional
  demo?: string;         // optional
  langs?: string[];      // techs
  year?: number;         // optional
};

// Bentuk data dari API
type DBRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_url: string | null; // disediakan API (sudah kita tambahkan)
  techs: string[] | null;
  repo_url: string | null;
  demo_url: string | null;
  year: number | null;
};

function mapFromDB(r: DBRow): Project {
  return {
    id: r.id,
    title: r.title,
    description: r.description ?? '',
    image: r.cover_url ?? '',
    href: `/project/${r.slug}`,
    repo: r.repo_url ?? undefined,
    demo: r.demo_url ?? undefined,
    langs: r.techs ?? undefined,
    year: r.year ?? undefined,
  };
}

/* Link ringan (underline animasi CSS) */
function MinimalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="group relative inline-flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white transition"
    >
      {children}
      <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-white transition-all duration-300 group-hover:w-full" />
    </a>
  );
}

/* Badge bahasa/tech */
function LangBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/85 hover:bg-white/15 transition">
      {label}
    </span>
  );
}

/* Kartu gambar (CSS-only hover) */
function ImageCard({
  src,
  alt,
  reverse,
  eager = false,
}: {
  src: string;
  alt: string;
  reverse?: boolean;
  eager?: boolean;
}) {
  return (
    <div
      className={[
        'group relative aspect-[1/1] sm:aspect-[4/3] w-full overflow-hidden rounded-2xl',
        'bg-neutral-400/60 ring-1 ring-white/20 shadow-lg shadow-black/10',
        reverse ? 'hover:-rotate-[0.6deg]' : 'hover:rotate-[0.6deg]',
        'transition-transform duration-300 will-change-transform',
      ].join(' ')}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 520px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          priority={eager}
          loading={eager ? 'eager' : 'lazy'}
        />
      ) : (
        <div className="grid h-full place-items-center text-white/60 text-sm">No Image</div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/0 via-white/0 to-white/10" />
    </div>
  );
}

function ProjectRow({
  p,
  reverse = false,
  index,
}: {
  p: Project;
  reverse?: boolean;
  index: number;
}) {
  return (
    <ScrollReveal variant="fade-up" duration={600}>
      <div className="grid items-center gap-8 md:gap-10 md:grid-cols-12">
        {/* Image */}
        <div className={['md:col-span-5', reverse ? 'md:order-last' : ''].join(' ')}>
          <ImageCard src={p.image} alt={p.title} reverse={reverse} eager={index === 0} />
        </div>

        {/* Text */}
        <div className="md:col-span-7">
          <h3 className={`${anton.className} text-3xl sm:text-4xl font-extrabold text-white`}>
            {p.title}
          </h3>
          <p className={`${manrope.className} mt-3 text-white/90 leading-relaxed`}>
            {p.description}
          </p>

          {/* Badge bahasa/tech */}
          {p.langs && p.langs.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {p.langs.map((l) => (
                <LangBadge key={l} label={l} />
              ))}
            </div>
          )}

          {/* Aksi opsional */}
          {p.href && (
            <div className="mt-4">
              <MinimalLink href={p.href}>
                Lihat detail
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </MinimalLink>
            </div>
          )}
        </div>
      </div>
    </ScrollReveal>
  );
}

export default function ProjectsSection({
  projects,        // jika disediakan (SSR), komponen tidak fetch
  title = 'Making Things',
  subtitle,
  limit = 24,      // opsional: batas fetch saat auto-fetch
}: {
  projects?: Project[];
  title?: string;
  subtitle?: string;
  limit?: number;
}) {
  const [fetched, setFetched] = useState<Project[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  // Jika props.projects tidak diberikan, komponen akan fetch ke API
  useEffect(() => {
    let alive = true;
    if (projects !== undefined) {
      // SSR path: pakai props saja, jangan fetch
      setFetched(null);
      return;
    }
    setLoading(true);
    setErr('');
    (async () => {
      try {
        const res = await fetch(`/api/portfolio?limit=${limit}`, { cache: 'no-store' });
        if (!res.ok) {
          const msg = await res.text().catch(() => '');
          throw new Error(msg || 'Failed to load projects');
        }
        const j = await res.json();
        const rows = (j.data ?? []) as DBRow[];
        const mapped = rows.map(mapFromDB);
        if (alive) setFetched(mapped);
      } catch (e: any) {
        if (alive) {
          setFetched([]);
          setErr(e?.message || 'Gagal memuat data');
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [projects, limit]);

  // Sumber data prioritas: props.projects (SSR) → fetched (CSR) → []
  const data = useMemo<Project[]>(() => {
    if (projects !== undefined) return projects;
    return fetched ?? [];
  }, [projects, fetched]);

  return (
    <section id="projects" className="theme-surface">
      <div className="container-app py-16 sm:py-20 md:py-24">
        {/* Heading center */}
        <div className="mb-10 sm:mb-14 md:mb-16 text-center">
          <h2 className={`${anton.className} text-white text-4xl sm:text-5xl md:text-6xl font-extrabold`}>
            {title}
          </h2>
          {subtitle ? <p className={`${manrope.className} mt-3 text-white/85`}>{subtitle}</p> : null}
          <div className="mx-auto mt-6 w-28 sm:w-36 md:w-44 hr-soft" />
        </div>

        {/* State handling */}
        {loading ? (
          <div className="text-center text-white/70">Loading…</div>
        ) : err ? (
          <div className="text-center text-red-300">{err}</div>
        ) : data.length === 0 ? (
          <div className="text-center text-white/70">Belum ada project.</div>
        ) : (
          <div className="space-y-16 sm:space-y-20 md:space-y-24">
            {data.map((p, i) => (
              <ProjectRow key={p.id} p={p} reverse={i % 2 === 1} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* Gap bawah */}
      <div className="h-24 sm:h-28 md:h-32" />
    </section>
  );
}