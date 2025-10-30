'use client';

import Image from 'next/image';
import { Anton, Manrope } from 'next/font/google';
import { useEffect, useRef, useState } from 'react';
import TaglineAnimated from '@/components/sections/TaglineAnimated';

const anton = Anton({ weight: '400', subsets: ['latin'] });
const manrope = Manrope({ subsets: ['latin'] });

function QuotesShowcase() {
  const quotes = [
    'Design is thinking made visual.',
    'Simplicity is the ultimate sophistication.',
    'Good design is honest. Great design is invisible.',
    'Make it simple, but significant.',
    'Creativity is intelligence having fun.',
  ];

  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [speed, setSpeed] = useState(26);

  // Typewriter loop (otomatis)
  useEffect(() => {
    const full = quotes[index];
    if (!deleting && typed.length < full.length) {
      const t = setTimeout(() => setTyped(full.slice(0, typed.length + 1)), speed);
      return () => clearTimeout(t);
    }
    if (!deleting && typed.length === full.length) {
      const t = setTimeout(() => setDeleting(true), 1600);
      return () => clearTimeout(t);
    }
    if (deleting && typed.length > 0) {
      const t = setTimeout(() => setTyped(full.slice(0, typed.length - 1)), 18);
      return () => clearTimeout(t);
    }
    if (deleting && typed.length === 0) {
      setDeleting(false);
      setIndex((i) => (i + 1) % quotes.length);
      setSpeed(26);
    }
  }, [typed, deleting, speed, index]);

  return (
    <div className="mt-10 sm:mt-12 md:mt-14">
      {/* Right aligned block: dorong ke kanan dgn ml-auto + text-right */}
      <div className="ml-auto max-w-4xl px-2 text-right">
        <blockquote
          className={`${anton.className} text-white text-2xl sm:text-3xl md:text-4xl leading-tight`}
        >
          “{typed}
          <span className="opacity-100">
            {!deleting && <span className="animate-pulse">▌</span>}
          </span>
          ”
        </blockquote>

        {/* Indikator dot minimal di kanan */}
        <div className="mt-3 flex items-center justify-end gap-1.5">
          {quotes.map((_, i) => (
            <span
              key={i}
              className={[
                'h-1.5 w-1.5 rounded-full transition-colors',
                i === index ? 'bg-white' : 'bg-white/35',
              ].join(' ')}
              aria-hidden
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AboutSection() {
  // Tilt + parallax untuk foto
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg)');
  const [parallax, setParallax] = useState(0);

  useEffect(() => {
    const onScroll = () => setParallax(Math.min(22, window.scrollY * 0.08));
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const dx = x / r.width - 0.5;
    const dy = y / r.height - 0.5;
    const rx = (-dy * 8).toFixed(2);
    const ry = (dx * 8).toFixed(2);
    setTransform(`perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`);
  };
  const onLeave = () => setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg)');

  return (
    <>
      {/* SECTION: Abstract About */}
      <section className={`${manrope.className} theme-surface pt-20 md:pt-24`}>
        <div className="container-app">
          <div className="grid items-center gap-10 lg:gap-16 lg:grid-cols-2">
            {/* Kiri: Portrait + abstract stage */}
            <div className="relative">
              {/* Blobs abstrak */}
              <div className="absolute -z-10 -left-10 -top-10 h-56 w-56 rounded-full bg-white/15 blur-3xl animate-[blob_12s_ease-in-out_infinite]" />
              <div className="absolute -z-10 -right-8 bottom-10 h-64 w-64 rounded-full bg-white/10 blur-3xl animate-[blob_14s_ease-in-out_infinite]" />

              {/* Orbit ring + chips */}
              <div className="pointer-events-none absolute inset-0 -z-10 grid place-items-center">
                <div className="relative h-[320px] w-[320px]">
                  <div className="absolute inset-0 rounded-full ring-1 ring-white/25" />
                  <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-2">
                    <span className="block h-2 w-2 rounded-full bg-white/80 shadow-[0_0_20px_rgba(255,255,255,0.6)] animate-[spin-slow_12s_linear_infinite] origin-[0_160px]" />
                  </div>
                </div>
                <div className="relative h-[380px] w-[380px]">
                  <div className="absolute inset-0 rounded-full ring-1 ring-white/20" />
                  <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-2 rotate-45">
                    <span className="block h-2 w-2 rounded-full bg-white/70 shadow-[0_0_18px_rgba(255,255,255,0.5)] animate-[spin-slow_18s_linear_infinite] origin-[0_190px]" />
                  </div>
                </div>
              </div>

              {/* Kartu foto dengan tilt */}
              <div
                ref={cardRef}
                onMouseMove={onMove}
                onMouseLeave={onLeave}
                className="group relative aspect-[3/4] w-full max-w-[560px] overflow-hidden rounded-2xl bg-neutral-400/80 ring-1 ring-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-transform duration-200 will-change-transform"
                style={{ transform, translate: `0 ${parallax * 0.35}px` }}
              >
                <Image
                  src="/about/biodata.png"
                  alt="Portrait"
                  fill
                  sizes="(max-width: 1024px) 100vw, 560px"
                  className="object-cover"
                  priority
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/0 via-white/0 to-white/10" />
              </div>

              {/* Tagline — animated hover */}
              <div className="absolute -bottom-10 left-4 sm:left-6 md:left-8 hidden md:block pointer-events-auto">
                <TaglineAnimated />
              </div>
              <div className="mt-6 md:hidden">
                <TaglineAnimated />
              </div>
            </div>

            {/* Kanan: Title + bio (tanpa badges & CTA) */}
            <div className="reveal-up">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                Chesta Ridho
              </h1>
              <p className="mt-5 text-base sm:text-lg text-white/90 leading-relaxed max-w-prose">
                Saya adalah seorang siswa dari SMKN 8 Malang dengan jurusan Rekayasa Perangkat Lunak. Saya memulai Praktik Kerja Lapangan 
                (PKL) ini pada tanggal 23 Juni 2025 yang akan berakhir pada tanggal 31 Oktober 2025. Selama masa PKL saya, saya gemar belajar dan mengembangkan kemampuan saya dalam bidang pengembangan perangkat lunak.
              </p>
            </div>
          </div>

          {/* Gap besar ke section berikutnya */}
          <div className="h-24 sm:h-28 md:h-32" />
        </div>
      </section>

      {/* SECTION: Quotes (minimal, right aligned, no buttons) */}
      <section aria-label="Creative Quotes" className="theme-surface">
        <div className="container-app py-12 sm:py-16 md:py-20">
          <h3 className="reveal-up text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
            Quotes For Creators
          </h3>
          <p className="reveal-up mt-3 max-w-2xl text-white" style={{ animationDelay: '120ms' }}>
            Inspirasi ringkas untuk anda yang ingin membuat mahakarya.
          </p>

          <QuotesShowcase />
        </div>
        {/* Gap antar section */}
        <div className="h-24 sm:h-28 md:h-32" />  
      </section>
    </>
  );
}   