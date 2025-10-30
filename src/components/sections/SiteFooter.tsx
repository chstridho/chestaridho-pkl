'use client';

import { Anton, Manrope } from 'next/font/google';
import { useRef, useState, MouseEvent } from 'react';

const anton = Anton({ weight: '400', subsets: ['latin'] });
const manrope = Manrope({ subsets: ['latin'] });

/* Tombol/Link magnetik ringan */
function Magnetic({
  children,
  className,
  href,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement | null>(null);
  const anim = useRef<number | null>(null);
  const pos = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  const move = (e: MouseEvent<any>) => {
    const el = ref.current as HTMLElement;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    pos.current.tx = dx * 0.25;
    pos.current.ty = dy * 0.25;
    if (anim.current == null) animate(el);
  };
  const leave = () => {
    const el = ref.current as HTMLElement;
    if (!el) return;
    pos.current.tx = 0; pos.current.ty = 0;
    if (anim.current == null) animate(el);
  };
  const animate = (el: HTMLElement) => {
    const loop = () => {
      const p = pos.current;
      p.x += (p.tx - p.x) * 0.15;
      p.y += (p.ty - p.y) * 0.15;
      el.style.transform = `translate(${p.x}px, ${p.y}px)`;
      if (Math.abs(p.x - p.tx) > 0.1 || Math.abs(p.y - p.ty) > 0.1) {
        anim.current = requestAnimationFrame(loop);
      } else {
        el.style.transform = 'translate(0,0)';
        if (anim.current) cancelAnimationFrame(anim.current);
        anim.current = null;
      }
    };
    anim.current = requestAnimationFrame(loop);
  };

  const base =
    'inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white/90 ' +
    'bg-white/10 hover:bg-white/20 ring-1 ring-white/20 backdrop-blur-md transition will-change-transform';

  if (href) {
    return (
      <a
        ref={ref as any}
        href={href}
        onMouseMove={move}
        onMouseLeave={leave}
        className={[base, className || ''].join(' ')}
      >
        {children}
      </a>
    );
  }
  return (
    <button
      ref={ref as any}
      onClick={onClick}
      onMouseMove={move}
      onMouseLeave={leave}
      className={[base, className || ''].join(' ')}
      type="button"
    >
      {children}
    </button>
  );
}

/* Ikon sederhana */
function Icon({ name, className = 'h-5 w-5' }: { name: 'github' | 'instagram' | 'dribbble' | 'linkedin'; className?: string }) {
  if (name === 'github')
    return <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.41-4.04-1.41-.55-1.41-1.35-1.79-1.35-1.79-1.1-.76.08-.74.08-.74 1.22.09 1.86 1.27 1.86 1.27 1.08 1.86 2.83 1.32 3.52 1.01.11-.78.42-1.32.76-1.62-2.66-.3-5.47-1.33-5.47-5.9 0-1.3.47-2.36 1.24-3.19-.12-.3-.54-1.52.12-3.16 0 0 1.01-.32 3.3 1.22a11.49 11.49 0 0 1 6 0c2.28-1.54 3.29-1.22 3.29-1.22.66 1.64.25 2.86.12 3.16.77.83 1.23 1.89 1.23 3.19 0 4.59-2.81 5.59-5.48 5.89.43.37.81 1.1.81 2.22v3.28c0 .32.21.7.83.58A12 12 0 0 0 12 .5z"/></svg>;
  if (name === 'instagram')
    return <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zm0 2a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM18.5 6A1.5 1.5 0 1 1 17 7.5 1.5 1.5 0 0 1 18.5 6z"/></svg>;
  if (name === 'dribbble')
    return <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2zm6.93 9.25c-2.53-.4-4.64-.23-6.31.5-.1-.22-.2-.43-.31-.64 2.16-1.03 3.72-2.68 4.66-4.95A8.02 8.02 0 0 1 18.93 11.25zM8.91 4.1a8.02 8.02 0 0 1 6.14.77c-.83 1.97-2.2 3.41-4.09 4.33-1.01-1.86-2.15-3.53-3.42-5.1.45-.01.92 0 1.37 0zM6.1 5.41c1.35 1.6 2.51 3.33 3.5 5.17-2.26.68-4.91.87-7.95.57A8.02 8.02 0 0 1 6.1 5.41zM2.08 12.9c3.49.34 6.45.07 8.89-.83.14.3.27.6.4.9-2.18.77-3.98 2.19-5.41 4.25a8 8 0 0 1-3.88-4.32zM7.29 18.8c1.3-1.89 2.9-3.18 4.82-3.86.7 1.86 1.18 3.94 1.44 6.23a8.04 8.04 0 0 1-6.26-2.36zM14.8 21.1c-.27-2.2-.74-4.15-1.4-5.86 1.44-.46 3.16-.56 5.15-.32a8.03 8.03 0 0 1-3.75 6.18z"/></svg>;
  return <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M19 0h-3a5 5 0 0 0-5 5v3H8v4h3v12h4V12h3l1-4h-4V5a1 1 0 0 1 1-1h3z"/></svg>;
}

export default function SiteFooter() {
  const [copied, setCopied] = useState(false);
  const email = 'charmingcaffeines@gmail.com';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  return (
    <footer className="theme-surface relative overflow-hidden">
      {/* Background abstrak */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-10 -left-10 h-64 w-64 rounded-full bg-white/12 blur-3xl animate-[blob_14s_ease-in-out_infinite]" />
        <div className="absolute -bottom-16 -right-10 h-72 w-72 rounded-full bg-white/10 blur-3xl animate-[blob_18s_ease-in-out_infinite]" />
        <div className="absolute inset-0 hero-grid opacity-[0.06]" />
      </div>

      <div className="container-app py-16 sm:py-20 md:py-24">
        {/* CTA utama */}
        <div className="text-center">
          <h2 className={`${anton.className} text-4xl sm:text-5xl md:text-6xl font-extrabold text-white`}>
            Mari Berkolaborasi
          </h2>
          <p className={`${manrope.className} mt-4 text-white/85 max-w-2xl mx-auto`}>
          Bereksperimen dengan yang berani. Merancang yang intuitif.
          </p>

          {/* Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Magnetic href="mailto:hello@yourdomain.com">
              Say Hello <span aria-hidden>→</span>
            </Magnetic>
            <Magnetic onClick={copy} className={copied ? 'bg-white/20' : ''}>
              {copied ? 'Email tersalin ✓' : 'Salin Email'}
            </Magnetic>
          </div>
        </div>

        {/* Divider + meta */}
        <div className="mt-12 hr-soft" />
        <div className="mt-6 flex flex-col gap-2 sm:flex-row items-center justify-between text-xs text-white/70">
          <span>© {new Date().getFullYear()} Chesta Ridho. All rights reserved.</span>
          <nav className={`${manrope.className} flex items-center gap-4`}>
            <a href="/about" className="hover:text-white transition">About</a>
            <a href="/project" className="hover:text-white transition">Project</a>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="rounded-full px-3 py-1.5 hover:bg-white/10 transition"
              aria-label="Kembali ke atas"
            >
              ↑ Ke atas
            </button>
          </nav>
        </div>
      </div>
    </footer>
  );
}