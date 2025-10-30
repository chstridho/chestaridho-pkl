'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Anton, Manrope } from 'next/font/google';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const anton = Anton({ weight: '400', subsets: ['latin'] });
const manrope = Manrope({ subsets: ['latin'] });
const ease = [0.2, 0.65, 0.2, 1] as const;

type Project = {
  id: string;
  title: string;
  description?: string | null;
  image?: string | null;
  langs?: string[] | null;
  repo?: string | null;
  demo?: string | null;
  year?: number | null;
};

export default function NewProjectPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const yearNow = useMemo(() => new Date().getFullYear(), []);
  const [form, setForm] = useState<Partial<Project>>({
    title: '',
    description: '',
    image: '',
    langs: [],
    repo: '',
    demo: '',
    year: yearNow,
  });

  // input mentah untuk Bahasa/Tech (dipisahkan koma)
  const [langsInput, setLangsInput] = useState<string>('');

  // Upload file (lokal)
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Shortcuts: Esc (kembali), Ctrl/Cmd+Enter (simpan)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'enter') {
        e.preventDefault();
        void submitDirect();
      }
      if (e.key === 'Escape') router.back();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, form, file, langsInput]);

  function setField<T extends keyof Project>(key: T, val: Project[T]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function submitDirect() {
    setErr(null);
    setSubmitting(true);
    try {
      if (!form.title) throw new Error('Judul wajib diisi');
      if (!file) throw new Error('Pilih gambar terlebih dahulu');

      const fd = new FormData();
      fd.set('title', form.title);
      fd.set('description', form.description || '');
      fd.set('techs', langsInput || ''); // server akan parse "A, B, C" → array
      if (form.repo) fd.set('repo_url', form.repo);
      if (form.demo) fd.set('demo_url', form.demo);
      if (form.year != null) fd.set('year', String(form.year));
      // default: langsung publish; featured=false
      fd.set('published', 'true');
      fd.set('featured', 'false');
      fd.set('file', file, file.name);

      await toast.promise(
        (async () => {
          const res = await fetch('/api/portfolio', { method: 'POST', body: fd });
          const ct = res.headers.get('content-type') || '';
          const payload = ct.includes('application/json') ? await res.json().catch(() => ({})) : await res.text();
          if (!res.ok) {
            const msg = typeof payload === 'string' ? payload.slice(0, 300) : payload?.error;
            throw new Error(msg || 'Gagal menambah project');
          }
        })(),
        { loading: 'Menyimpan project…', success: 'Project berhasil ditambahkan!', error: (e) => e.message || 'Gagal menyimpan' }
      );

      router.replace('/admin/portofolio'); // pakai ejaan yang kamu gunakan
    } catch (e: any) {
      setErr(e?.message || 'Gagal menyimpan');
    } finally {
      setSubmitting(false);
    }
  }

  // Drag & Drop handlers
  function onDragOver(e: React.DragEvent) { e.preventDefault(); setDrag(true); }
  function onDragLeave() { setDrag(false); }
  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files?.[0]; if (!f) return;
    if (!f.type.startsWith('image/')) { alert('File harus gambar'); return; }
    setFile(f);
  }

  const langsPreview = useMemo(
    () => langsInput.split(',').map((s) => s.trim()).filter(Boolean),
    [langsInput]
  );

  return (
    <div className="theme-surface min-h-dvh relative overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-28 -left-24 h-72 w-72 rounded-full bg-white/12 blur-3xl animate-[blob_14s_ease-in-out_infinite]" />
        <div className="absolute -bottom-20 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl animate-[blob_18s_ease-in-out_infinite]" />
        <div className="absolute inset-0 hero-grid opacity-[0.06]" />
      </div>

      <div className="container-app py-8 sm:py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <h1 className={`${anton.className} text-3xl sm:text-4xl font-extrabold text-white`}>Tambah Project</h1>
            <p className={`${manrope.className} mt-1 text-white/85`}>Upload gambar lokal, isi detail, dan simpan.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/portofolio" className="rounded-full bg-white/10 px-4 py-2 text-sm text-white ring-1 ring-white/20 hover:bg-white/15 transition">
              ← Kembali ke daftar
            </Link>
          </div>
        </motion.div>

        {/* Form + Preview */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.05 }}
          className="mt-6 grid gap-6 lg:grid-cols-12"
        >
          {/* Form kiri */}
          <form
            onSubmit={(e) => { e.preventDefault(); void submitDirect(); }}
            className="lg:col-span-7 grid gap-4"
          >
            {err && (
              <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {err}
              </div>
            )}

            <div className="grid gap-1.5">
              <label className="text-xs font-semibold uppercase text-white/80">Judul</label>
              <input
                value={form.title || ''}
                onChange={(e) => setField('title', e.target.value)}
                required
                className="input-el rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none focus:border-white/40"
                placeholder="Judul project"
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-semibold uppercase text-white/80">Deskripsi</label>
              <textarea
                value={form.description || ''}
                onChange={(e) => setField('description', e.target.value)}
                className="input-el rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none focus:border-white/40 min-h-[100px]"
                placeholder="Deskripsi singkat"
              />
            </div>

            {/* Upload gambar lokal */}
            <div className="grid gap-1.5">
              <label className="text-xs font-semibold uppercase text-white/80">Gambar</label>
              <label
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={[
                  'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 text-white/80',
                  drag ? 'border-white/50 bg-white/10' : 'border-white/25 bg-white/5 hover:bg-white/10',
                ].join(' ')}
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    if (f && !f.type.startsWith('image/')) { alert('File harus gambar'); return; }
                    setFile(f);
                  }}
                />
                <div className="text-sm">{file ? file.name : 'Klik untuk memilih gambar atau tarik ke sini'}</div>
                <div className="text-[11px] text-white/60">PNG/JPG/JPEG/WEBP • Maks 5MB</div>
              </label>
            </div>

            <div className="grid gap-1.5 lg:grid-cols-2 lg:gap-4">
              <div className="grid gap-1.5">
                <label className="text-xs font-semibold uppercase text-white/80">Bahasa/Tech (pisahkan koma)</label>
                <input
                  value={langsInput}
                  onChange={(e) => setLangsInput(e.target.value)}
                  className="input-el rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none focus:border-white/40"
                  placeholder="TypeScript, Next.js, Tailwind"
                />
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs font-semibold uppercase text-white/80">Repo (opsional)</label>
                <input
                  value={form.repo || ''}
                  onChange={(e) => setField('repo', e.target.value)}
                  className="input-el rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none focus:border-white/40"
                  placeholder="https://github.com/…"
                />
              </div>
            </div>

            <div className="grid gap-1.5 lg:grid-cols-2 lg:gap-4">
              <div className="grid gap-1.5">
                <label className="text-xs font-semibold uppercase text-white/80">Demo Website</label>
                <input
                  value={form.demo || ''}
                  onChange={(e) => setField('demo', e.target.value)}
                  className="input-el rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none focus:border-white/40"
                  placeholder="https://app-demo.vercel.app"
                />
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs font-semibold uppercase text-white/80">Tahun</label>
                <input
                  value={form.year ?? ''}
                  onChange={(e) => setField('year', e.target.value ? Number(e.target.value) : undefined)}
                  type="number"
                  min={2000}
                  max={2100}
                  className="input-el rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none focus:border-white/40"
                  placeholder={String(yearNow)}
                />
              </div>
            </div>

            <div className="mt-3 flex items-left justify-end gap-2">
              <Link href="/admin/portofolio" className="rounded-full bg-white/10 px-4 py-2 text-sm text-white ring-1 ring-white/20 hover:bg-white/15 transition">
                Batal
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-white/15 px-4 py-2 text-sm text-white ring-1 ring-white/20 hover:bg-white/20 transition"
              >
                {submitting ? 'Menyimpan…' : 'Tambah'}
              </button>
            </div>
          </form>

          {/* Preview kanan */}
          <div className="lg:col-span-5">
            <div className="sticky top-6">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 ring-1 ring-white/15">
                <h3 className="text-white/90 font-semibold">Preview</h3>
                <div className="mt-3 relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-neutral-400/60">
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt={form.title || 'preview'} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center text-white/60 text-sm">No Image</div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/0 via-white/0 to-white/10" />
                </div>
                <div className="mt-3">
                  <div className="text-white font-semibold text-lg">{form.title || 'Judul project'}</div>
                  <p className={`${manrope.className} mt-1 text-sm text-white/80`}>
                    {form.description || 'Deskripsi singkat akan tampil di sini.'}
                  </p>

                  {langsPreview.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {langsPreview.map((l) => (
                        <span key={l} className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/85">
                          {l}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <p className="mt-3 text-xs text-white/70">Ctrl/⌘+Enter untuk menyimpan cepat.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}