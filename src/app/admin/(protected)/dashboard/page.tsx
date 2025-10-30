'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Anton, Manrope } from 'next/font/google';
import { motion } from 'framer-motion';
import { publicStorageUrl } from '@/lib/storage';

const anton = Anton({ weight: '400', subsets: ['latin'] });
const manrope = Manrope({ subsets: ['latin'] });
const ease = [0.2, 0.65, 0.2, 1] as const;

type Project = {
  id: string;
  title: string;
  description?: string | null;
  image?: string | null;   // URL publik (dari cover_path)
  langs?: string[] | null; // techs
  href?: string | null;    // link viewer detail
  updated_at?: string | null;
};

type DBRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_path: string | null;
  techs: string[] | null;
  updated_at: string | null;
};

function mapRow(r: DBRow): Project {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    image: r.cover_path ? publicStorageUrl(r.cover_path) : null,
    langs: r.techs ?? [],
    href: `/project/${r.slug}`,
    updated_at: r.updated_at,
  };
}

/* Icons */
function IconPlus(props: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2h6z" /></svg>;
}
function IconFolder(props: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M10 4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6z" /></svg>;
}
function IconHome(props: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 3l10 9h-3v9h-5v-6H10v6H5v-9H2l10-9z" /></svg>;
}
function IconLogout(props: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M16 13v-2H7V8l-5 4 5 4v-3h9zm3-10H11a2 2 0 0 0-2 2v3h2V5h8v14h-8v-3H9v3a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" /></svg>;
}
function IconPencil(props: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm18-11.5a1 1 0 0 0 0-1.41L18.66 1a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75L21 5.75z"/></svg>;
}
function IconEye(props: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/><circle cx="12" cy="12" r="2.5"/></svg>;
}
function IconExternal(props: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3z"/><path d="M5 5h5V3H5c-1.1 0-2 .9-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-5h-2v5H5V5z"/></svg>;
}

function LangBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/85">
      {label}
    </span>
  );
}

/* Tombol interaktif (chip) */
function ActionChip({
  href,
  icon,
  children,
  newTab,
  variant = 'solid',
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  newTab?: boolean;
  variant?: 'solid' | 'outline';
}) {
  const base =
    'inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium ring-1 transition-colors';
  const style =
    variant === 'solid'
      ? 'bg-white/15 text-white ring-white/20 hover:bg-white/20'
      : 'bg-white/5 text-white ring-white/20 hover:bg-white/10';
  return (
    <motion.div whileHover={{ y: -1, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Link
        href={href}
        target={newTab ? '_blank' : undefined}
        className={`${base} ${style}`}
      >
        <span className="opacity-90">{icon}</span>
        {children}
      </Link>
    </motion.div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [items, setItems] = useState<Project[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/portfolio?includeDrafts=true&limit=100', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch');
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
    return items.filter(p =>
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
      if (e.key.toLowerCase() === 'a') router.push('/admin/portofolio/new');
      if (e.key.toLowerCase() === 'l') void doLogout();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [router]);

  async function doLogout() {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
    router.replace('/admin/login');
  }

  return (
    <div className="theme-surface min-h-dvh relative overflow-hidden">
      {/* background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-28 -left-24 h-72 w-72 rounded-full bg-white/12 blur-3xl animate-[blob_14s_ease-in-out_infinite]" />
        <div className="absolute -bottom-20 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl animate-[blob_18s_ease-in-out_infinite]" />
        <div className="absolute inset-0 hero-grid opacity-[0.06]" />
      </div>

      <div className="container-app py-10 sm:py-12">
        {/* header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <h1 className={`${anton.className} text-3xl sm:text-4xl font-extrabold text-white`}>Dashboard</h1>
            <p className={`${manrope.className} mt-1 text-white/85`}>Kelola konten portofolio dengan cepat.</p>
          </div>

          {/* quick actions */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Link href="/admin/portofolio/new" className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm text-white ring-1 ring-white/20 hover:bg-white/20 transition"><IconPlus className="h-4 w-4" /> Tambah Project</Link>
            <Link href="/admin/portofolio" className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white ring-1 ring-white/20 hover:bg-white/15 transition"><IconFolder className="h-4 w-4" /> Kelola Project</Link>
            <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white ring-1 ring-white/20 hover:bg-white/15 transition"><IconHome className="h-4 w-4" /> Beranda </Link>
            <button onClick={doLogout} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white ring-1 ring-white/20 hover:bg-white/15 transition"><IconLogout className="h-4 w-4" /> Logout</button>
          </div>
        </motion.div>

        {/* search + stats */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease, delay: 0.05 }} className="mt-6 grid gap-4 md:grid-cols-12">
          <div className="md:col-span-6">
            <div className="input-wrap flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2">
              <input ref={searchRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari project anda…" className="w-full bg-transparent text-white placeholder:text-white/60 outline-none py-1" />
            </div>
          </div>
          <div className="md:col-span-6 grid grid-cols-3 gap-5">
            <StatCard label="Projects" value={items.length} />
            <StatCard label="Updated" value={getLatest(items)} />
            <StatCard label="Langs" value={uniqueLangs(items)} />
          </div>
        </motion.div>

        {/* list projects */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45, ease, delay: 0.1 }} className="mt-8 grid gap-4 sm:gap-5 md:grid-cols-2">
          {!loading && items.length === 0 && (
            <div className="rounded-2xl border border-white/20 bg-white/10 p-6 text-white/70">Belum ada project.</div>
          )}
          {items.map((p) => <ProjectCard key={p.id} p={p} />)}
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-white/20 bg-white/10 p-3 text-center text-white">
      <div className="text-xs text-white/70">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}

function ProjectCard({ p }: { p: Project }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group rounded-2xl border border-white/20 bg-white/10 p-4 ring-1 ring-white/15"
    >
      {/* Header kartu */}
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-white font-semibold text-lg">{p.title}</h3>
      </div>

      {/* Gambar/placeholder singkat (opsional) */}
      {/* Bisa ditambahkan preview di sini jika perlu */}

      {/* Deskripsi ringkas */}
      {p.description && <p className="mt-2 text-sm text-white/80">{p.description}</p>}

      {/* Tech chips */}
      {p.langs && p.langs.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {p.langs.map((l) => <LangBadge key={l} label={l} />)}
        </div>
      )}

      {/* Aksi interaktif */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {/* Edit */}
        <ActionChip
          href={`/admin/portofolio/edit?pid=${p.id}`}
          icon={<IconPencil className="h-4 w-4" />}
          variant="solid"
        >
          Edit
        </ActionChip>

        {/* Lihat detail (ke viewer detail) */}
        {p.href && (
          <ActionChip
            href={p.href}
            icon={<IconEye className="h-4 w-4" />}
            variant="outline"
          >
            Lihat detail
          </ActionChip>
        )}

        {/* Lihat viewer (daftar publik) */}
        <ActionChip
          href="/project"
          icon={<IconExternal className="h-4 w-4" />}
          variant="outline"
        >
          Lihat viewer
        </ActionChip>

        {/* Meta update di ujung kanan */}
        {p.updated_at && (
          <span className="ml-auto text-[11px] text-white/60">
            Upd: {p.updated_at.slice(0, 10)}
          </span>
        )}
      </div>
    </motion.div>
  );
}

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