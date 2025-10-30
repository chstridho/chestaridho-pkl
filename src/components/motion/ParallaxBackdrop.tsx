'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export default function ParallaxBackdrop({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [y, setY] = useState(0);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    // Simple scroll handler
    const handleScroll = () => setY(window.scrollY);
    
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Simple mouse move handler
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    
    const r = el.getBoundingClientRect();
    const mx = e.clientX - r.left;
    const my = e.clientY - r.top;
    
    el.style.setProperty('--mx', `${mx}px`);
    el.style.setProperty('--my', `${my}px`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={cn('pointer-events-none fixed inset-0 -z-10 overflow-hidden', className)}
      style={{
        background:
          'radial-gradient(600px 400px at var(--mx,50%) var(--my,40%), rgba(255,255,255,.08), transparent 70%)',
      }}
    >
      <div
        className="parallax-blob absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-white/6"
        style={{ transform: `translateY(${y * 0.05}px)` }}
      />
      <div
        className="parallax-blob absolute top-1/3 -right-20 h-[24rem] w-[24rem] rounded-full bg-white/5"
        style={{ transform: `translateY(${y * -0.03}px)` }}
      />
      <div
        className="parallax-blob absolute -bottom-24 left-1/3 h-[20rem] w-[20rem] rounded-full bg-white/4"
        style={{ transform: `translateY(${y * 0.08}px)` }}
      />
    </div>
  );
}