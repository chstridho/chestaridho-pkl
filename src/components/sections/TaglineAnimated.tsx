'use client';

import { Anton } from 'next/font/google';
import type { CSSProperties } from 'react';

const anton = Anton({ weight: '400', subsets: ['latin'] });

function AnimatedLine({ text }: { text: string }) {
  return (
    <span className="block overflow-visible">
      {Array.from(text).map((ch, i) => (
        <span
          key={`${text}-${i}`}
          className="char"
          style={{ animationDelay: `${i * 35}ms` } as CSSProperties}
        >
          {ch === ' ' ? '\u00A0' : ch}
        </span>
      ))}
    </span>
  );
}

export default function TaglineAnimated({
  className = '',
  line1 = 'The Person',
  line2 = 'Behind The Work',
}: {
  className?: string;
  line1?: string;
  line2?: string;
}) {
  return (
    <div
      className={`tagline-animated ${anton.className} text-white select-none ${className}`}
      style={{ textShadow: '0 2px 0 rgba(0,0,0,0.12)', fontSize: 'clamp(36px, 6.2vw, 72px)' }}
    >
      <AnimatedLine text={line1} />
      <AnimatedLine text={line2} />
    </div>
  );
}