export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

type Row = {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    cover_path: string | null;   // objectKey di bucket
    techs: string[] | null;
    repo_url: string | null;
    demo_url: string | null;
    year: number | null;
};

// helper: normalisasi key lama "portfolio/..."
// dan bangun URL publik dari BUCKET + key
const BUCKET = process.env.NEXT_PUBLIC_BUCKET_PORTFOLIO || 'portfolio';
function normalizeKey(key: string | null | undefined) {
    const k = String(key || '').replace(/^\/+/, '');
    return k.replace(/^(portfolio|portofolio)\//, '');
}
function buildCoverUrl(key: string | null | undefined) {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const k = normalizeKey(key);
    return k ? `${base}/storage/v1/object/public/${BUCKET}/${k}` : null;
}

// Ambil data langsung dari Supabase (RLS publik: published = true)
async function getDataFromDB(slug: string): Promise<{
    title: string;
    description: string | null;
    cover_url: string | null;
    techs: string[] | null;
    repo_url: string | null;
    demo_url: string | null;
    year: number | null;
} | null> {
    const supabase = createServerComponentClient({ cookies });

    const { data, error } = await supabase
        .from('portfolio')
        .select('title, description, cover_path, techs, repo_url, demo_url, year, published')
        .eq('slug', slug)
        .eq('published', true)     // pastikan hanya yang published
        .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;

    return {
        title: data.title,
        description: data.description,
        cover_url: buildCoverUrl(data.cover_path),
        techs: data.techs,
        repo_url: data.repo_url,
        demo_url: data.demo_url,
        year: data.year,
    };
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await props.params;
        const data = await getDataFromDB(slug);
        if (!data) return { title: 'Project not found' };
        return {
            title: `${data.title} • Portfolio`,
            description: data.description ?? undefined,
            openGraph: data.cover_url ? { images: [{ url: data.cover_url }] } : undefined,
        };
    } catch {
        // Jangan lempar error ke build/runtime → fallback metadata
        return { title: 'Project' };
    }
}

export default async function ProjectDetailPage(props: { params: Promise<{ slug: string }> }) {
    const { slug } = await props.params;

    let data: Awaited<ReturnType<typeof getDataFromDB>> = null;
    try {
        data = await getDataFromDB(slug);
    } catch {
        // Jika query error tak terduga, anggap tidak ditemukan
        data = null;
    }
    if (!data) notFound();

    const { title, description, techs, cover_url, repo_url, demo_url, year } = data;

    return (
        <section className="theme-surface">
            <div className="container-app pt-24 sm:pt-28 lg:pt-32 pb-12">
                <div className="grid gap-6 md:grid-cols-12">
                    {/* Left: Preview */}
                    <div className="md:col-span-6">
                        <div className="rounded-2xl border border-white/20 bg-white/10 p-4 ring-1 ring-white/15">
                            <h3 className="text-white/90 font-semibold">Preview</h3>
                            <div className="mt-3 relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-neutral-400/60">
                                {cover_url ? (
                                    <Image
                                        src={cover_url}
                                        alt={title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 640px"
                                        className="object-cover"
                                        priority
                                    />
                                ) : (
                                    <div className="grid h-full place-items-center text-white/60 text-sm">No Image</div>
                                )}
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                                <figcaption className="absolute left-3 bottom-3 rounded-full bg-black/45 px-3 py-1 text-xs text-white/95 ring-1 ring-white/20">
                                    Judul Project: <span className="font-semibold">{title}</span>
                                </figcaption>
                            </div>
                        </div>
                    </div>

                    {/* Right: Details */}
                    <div className="md:col-span-6">
                        <div className="rounded-2xl border border-white/20 bg-white/10 p-5 ring-1 ring-white/15">
                            <div className="text-[11px] font-semibold uppercase tracking-wide text-white/70">
                                Judul Project
                            </div>
                            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-white">{title}</h1>
                            {year ? <div className="mt-3 text-xs text-white/70">Tahun: {year}</div> : null}

                            <div className="mt-5">
                                <div className="text-sm font-semibold text-white/85">Deskripsi</div>
                                {description ? (
                                    <p className="mt-2 text-white/90 leading-relaxed">{description}</p>
                                ) : (
                                    <p className="mt-2 text-white/60">Tidak ada deskripsi.</p>
                                )}
                            </div>

                            {techs && techs.length > 0 && (
                                <div className="mt-6">
                                    <div className="text-sm font-semibold text-white/85">Tech Stack</div>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {techs.map((t) => (
                                            <span
                                                key={t}
                                                className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/85"
                                            >
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link
                                    href="/project"
                                    className="rounded-full bg-white/12 px-4 py-2 text-sm text-white ring-1 ring-white/20 hover:bg-white/20 transition"
                                >
                                    ← Kembali ke daftar
                                </Link>
                                {repo_url && (
                                    <a
                                        href={repo_url.startsWith('http') ? repo_url : `https://${repo_url}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="rounded-full bg-white/12 px-4 py-2 text-sm text-white ring-1 ring-white/20 hover:bg-white/20 transition"
                                    >
                                        Repository
                                    </a>
                                )}
                                {demo_url && (
                                    <a
                                        href={demo_url.startsWith('http') ? demo_url : `https://${demo_url}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="rounded-full bg-white/12 px-4 py-2 text-sm text-white ring-1 ring-white/20 hover:bg-white/20 transition"
                                    >
                                        Live Demo
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}