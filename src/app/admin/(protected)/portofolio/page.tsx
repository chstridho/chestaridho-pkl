'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Anton, Manrope } from 'next/font/google';
import { motion } from 'framer-motion';
import { publicStorageUrl } from '@/lib/storage';
import AlertDialog from '@/components/ui/AlertDialog';
import { toast } from 'sonner';

const anton = Anton({ weight: '400', subsets: ['latin'] });
const manrope = Manrope({ subsets: ['latin'] });
const ease = [0.2, 0.65, 0.2, 1] as const;

/* ===================== Types ===================== */
type Project = {
  id: string;
  title: string;
  description?: string | null;
  image?: string | null;    // URL publik (cover_path)
  langs?: string[] | null;  // techs
  repo?: string | null;
  demo?: string | null;
  year?: number | null;
  updated_at?: string | null;
};

type DBRow = {
  id: string; slug: string; title: string; description: string | null;
  cover_path: string | null; techs: string[] | null;
  repo_url: string | null; demo_url: string | null;
  year: number | null; updated_at: string | null;
};

function mapRow(r: DBRow): Project {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    image: r.cover_path ? publicStorageUrl(r.cover_path) : null,
    langs: r.techs ?? [],
    repo: r.repo_url,
    demo: r.demo_url,
    year: r.year,
    updated_at: r.updated_at,
  };
}

/* ===================== Icons ===================== */
function IconPencil(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm18-11.5a1 1 0 0 0 0-1.41L18.66 1a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75L21 5.75z"/>
    </svg>
  );
}
function IconTrash(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M9 3h6l1 1h5v2H3V4h5l1-1zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9z"/>
    </svg>
  );
}
function IconPlus(props: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2h6z" /></svg>;
}
function IconBack(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
    </svg>
  );
}

/* ===================== UI smalls ===================== */
function LangBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/85">
      {label}
    </span>
  );
}

/* Tombol chip interaktif (variant: primary | outline | danger) */
function ActionButton({
  children,
  icon,
  onClick,
  href,
  variant = 'primary',
  newTab,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'outline' | 'danger';
  newTab?: boolean;
}) {
  const base =
    'inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium ring-1 transition-colors';
  const style =
    variant === 'danger'
      ? 'bg-red-500/85 text-white ring-red-300/20 hover:bg-red-500'
      : variant === 'outline'
      ? 'bg-white/5 text-white ring-white/20 hover:bg-white/10'
      : 'bg-white/15 text-white ring-white/20 hover:bg-white/20';

  const El = href ? Link : ('button' as any);

  return (
    <motion.div whileHover={{ y: -1, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <El
        href={href as any}
        onClick={onClick}
        target={newTab ? '_blank' : undefined}
        className={`${base} ${style}`}
      >
        <span className="opacity-90">{icon}</span>
        {children}
      </El>
    </motion.div>
  );
}

/* ===================== Page ===================== */
export default function AdminPortofolioPage() {
  const router = useRouter();
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  // state dialog konfirmasi hapus
  const [confirm, setConfirm] = useState<{ open: boolean; id?: string; title?: string; loading?: boolean }>({
    open: false,
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/portfolio?includeDrafts=true&limit=100', { cache: 'no-store' });
        if (!res.ok) throw new Error('fetch failed');
        const j = await res.json();
        const rows = (j.data ?? []) as DBRow[];
        if (alive) setItems(rows.map(mapRow));
      } catch {
        if (alive) setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((p) =>
      p.title.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.langs || []).join(' ').toLowerCase().includes(q)
    );
  }, [items, query]);

  const searchRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key.toLowerCase() === 'n') router.push('/admin/portofolio/new');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [router]);

  return (
    <div className="theme-surface min-h-dvh relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-28 -left-24 h-72 w-72 rounded-full bg-white/12 blur-3xl animate-[blob_14s_ease-in-out_infinite]" />
        <div className="absolute -bottom-20 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl animate-[blob_18s_ease-in-out_infinite]" />
        <div className="absolute inset-0 hero-grid opacity-[0.06]" />
      </div>

      <div className="container-app py-10 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <h1 className={`${anton.className} text-3xl sm:text-4xl font-extrabold text-white`}>Kelola Portofolio</h1>
            <p className={`${manrope.className} mt-1 text-white/85`}>Tambah, ubah, hapus proyek dengan mudah.</p>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Link
              href="/admin/portofolio/new"
              className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm text-white ring-1 ring-white/20 hover:bg-white/20 transition"
            >
              <IconPlus className="h-4 w-4" />
              Tambah Project
            </Link>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white ring-1 ring-white/20 hover:bg-white/15 transition"
            >
              <IconBack className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/project"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white ring-1 ring-white/20 hover:bg-white/15 transition"
            >
              Lihat Viewer
            </Link>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.05 }}
          className="mt-6"
        >
          <div className="input-wrap flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2">
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari project anda…"
              className="w-full bg-transparent text-white placeholder:text-white/60 outline-none py-1"
              aria-label="Cari project"
            />
          </div>
        </motion.div>

        {/* List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45, ease, delay: 0.1 }}
          className="mt-8 grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {loading && <div className="col-span-full text-white/70">Memuat data…</div>}

          {!loading && filtered.length === 0 && (
            <div className="col-span-full rounded-2xl border border-white/20 bg-white/10 p-6 text-white/70">
              Belum ada project.
            </div>
          )}

          {filtered.map((p) => (
            <article
              key={p.id}
              className="group rounded-2xl border border-white/20 bg-white/10 p-4 ring-1 ring-white/15"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-neutral-400/60">
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.image}
                    alt={p.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-white/50 text-sm">No Image</div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/0 via-white/0 to-white/10" />
              </div>

              {/* Title */}
              <div className="mt-3">
                <h3 className="text-white font-semibold">{p.title}</h3>
              </div>

              {/* Desc */}
              {p.description && (
                <p className="mt-1 text-sm text-white/80 line-clamp-2">{p.description}</p>
              )}

              {/* Tech */}
              {p.langs && p.langs.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {p.langs.map((l) => <LangBadge key={l} label={l} />)}
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <ActionButton
                  href={`/admin/portofolio/edit?pid=${p.id}`}
                  icon={<IconPencil className="h-4 w-4" />}
                  variant="primary"
                >
                  Edit
                </ActionButton>

                <ActionButton
                  icon={<IconTrash className="h-4 w-4" />}
                  variant="danger"
                  onClick={() => setConfirm({ open: true, id: p.id, title: p.title, loading: false })}
                >
                  Hapus
                </ActionButton>

                {p.updated_at && (
                  <span className="ml-auto text-[11px] text-white/60">
                    Upd: {p.updated_at.slice(0, 10)}
                  </span>
                )}
              </div>
            </article>
          ))}
        </motion.div>
      </div>

      {/* Alert dialog konfirmasi hapus */}
      <AlertDialog
        open={confirm.open}
        title="Hapus Project?"
        description={`Project “${confirm.title ?? ''}” akan dihapus permanen beserta gambar cover di Storage.`}
        confirmText="Ya, hapus"
        cancelText="Batal"
        loading={confirm.loading}
        onCancel={() => setConfirm({ open: false })}
        onConfirm={async () => {
          if (!confirm.id) return;
          setConfirm((c) => ({ ...c, loading: true }));
          const t = toast.loading('Menghapus…');
          try {
            const res = await fetch(`/api/portfolio/${confirm.id}`, { method: 'DELETE' });
            const ct = res.headers.get('content-type') || '';
            const body = ct.includes('application/json') ? await res.json() : await res.text();

            if (!res.ok) {
              const msg = typeof body === 'string' ? body : (body as any)?.error;
              throw new Error(msg || 'Gagal menghapus');
            }

            setItems((prev) => prev.filter((x) => x.id !== confirm.id));
            toast.success('Berhasil dihapus', { id: t });
            setConfirm({ open: false });
          } catch (e: any) {
            toast.error(e?.message || 'Gagal menghapus', { id: t });
            setConfirm((c) => ({ ...c, loading: false }));
          }
        }}
      />
    </div>
  );
}

/* ===================== Helpers ===================== */
function getLatest(items: Project[]): string | number {
  if (items.length === 0) return 0;
  const ts = items.map(p => (p.updated_at ? Date.parse(p.updated_at) : 0)).reduce((a, b) => Math.max(a, b), 0);
  if (!ts) return '-';
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function uniqueLangs(items: Project[]): number {
  const set = new Set<string>();
  items.forEach(p => (p.langs || []).forEach(l => set.add(l)));
  return set.size;
}