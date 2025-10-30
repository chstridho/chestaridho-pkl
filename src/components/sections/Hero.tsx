'use client';

import Image from 'next/image';
import { Anton } from 'next/font/google';
import { useEffect, useRef } from 'react';

const anton = Anton({ weight: '400', subsets: ['latin'] });

export default function Hero() {
  const sectionRef = useRef<HTMLDivElement | null>(null);

  // Spotlight mouse (tetap, ringan dengan rAF; boleh hapus jika tak perlu)
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch =
      typeof window !== 'undefined' &&
      window.matchMedia('(pointer: coarse)').matches;

    if (prefersReduced || isTouch) return;

    let rafId = 0;
    const onMove = (e: MouseEvent) => {
      if (rafId) cancelAnimationFrame(rafId);
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      rafId = requestAnimationFrame(() => {
        el.style.setProperty('--mx', `${x}px`);
        el.style.setProperty('--my', `${y}px`);
      });
    };

    el.addEventListener('mousemove', onMove);
    return () => {
      el.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const title = 'PORTOFOLIO.';

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden theme-surface pt-[3.75rem] md:pt-[4.5rem]"
    >
      {/* Background accents (boleh dikurangi jika ingin ekstra ringan) */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute inset-0 hero-grid" />
        <div className="absolute inset-0 hero-spotlight" />
      </div>

      <div className="container-app">
        <div className="min-h-[calc(100svh-60px)] md:min-h-[calc(100svh-72px)] flex flex-col justify-center py-8 sm:py-12 md:py-16">
          
          {/* Main Content - Centered Layout */}
          <div className="text-center space-y-8 sm:space-y-10 md:space-y-12">
            
            {/* Title */}
            <div className="space-y-4 sm:space-y-6">
              <h1
                className={`${anton.className} text-white leading-none tracking-tight mx-auto`}
                style={{ fontSize: 'clamp(48px, 12vw, 128px)' }}
                aria-label={title}
                role="heading"
              >
                {Array.from(title).map((ch, i) => (
                  <span
                    key={i}
                    className="inline-block letter-rise"
                    style={{ animationDelay: `${i * 45}ms` }}
                  >
                    {ch === ' ' ? '\u00A0' : ch}
                  </span>
                ))}
              </h1>

              <p
                className="mx-auto max-w-2xl text-xs sm:text-sm md:text-base font-semibold uppercase text-white/90 reveal-up px-4"
                style={{ animationDelay: '680ms' }}
              >
                Praktek Kerja Lapangan Universitas Islam Negeri
                <br className="hidden sm:block" />
                Maulana Malik Ibrahim Malang
              </p>
            </div>

            {/* Logos - Responsive Layout */}
            <div className="reveal-up" style={{ animationDelay: '800ms' }}>
              <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-10">
                {/* Logo UIN */}
                <div className="flex-shrink-0">
                  <Image
                    src="/logo/uin.png"
                    alt="Logo UIN"
                    width={120}
                    height={120}
                    className="h-[clamp(60px,15vw,100px)] w-[clamp(60px,15vw,100px)] object-contain"
                    priority
                  />
                </div>

                {/* Divider */}
                <div className="h-[clamp(40px,12vw,80px)] w-px bg-white/60 flex-shrink-0" />

                {/* Logo SMK */}
                <div className="flex-shrink-0">
                  <Image
                    src="/logo/smk.png"
                    alt="Logo SMK"
                    width={120}
                    height={120}
                    className="h-[clamp(60px,15vw,100px)] w-[clamp(60px,15vw,100px)] object-contain"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 reveal-up px-4"
              style={{ animationDelay: '900ms' }}
            >
              <a
                href="/project"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white/15 px-6 py-3 text-sm font-semibold text-white/90 hover:bg-white/20 transition"
              >
                Lihat Proyek
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a
                href="#contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white/90 hover:bg-white/10 transition"
              >
                Kontak
              </a>
            </div>
          </div>
        </div>

        {/* Gap ke About */}
        <div className="h-32 sm:h-40 md:h-48" />
      </div>

      {/* Scroll cue */}
      <a
        href="#about"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center text-white/70 hover:text-white transition"
      >
        <span className="text-xs font-medium uppercase">Scroll</span>
        <span className="mt-1 h-6 w-px bg-white/60 animate-[floaty_2s_ease-in-out_infinite]" />
      </a>
    </section>
  );
}