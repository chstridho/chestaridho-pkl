'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';

export default function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      document.documentElement.style.scrollBehavior = 'smooth';
      return;
    }

    // Simple CSS-based smooth scroll for better performance
    document.documentElement.style.scrollBehavior = 'smooth';

    // Handle anchor links with native smooth scroll
    const handleAnchorClick = (e: Event) => {
      const target = e.currentTarget as HTMLAnchorElement;
      const href = target.getAttribute('href') || '';
      
      // Handle hash links
      const hash = href.startsWith('/#') ? href.slice(2) : href.startsWith('#') ? href.slice(1) : '';
      if (!hash) return;
      
      const element = document.getElementById(hash);
      if (!element) return;
      
      e.preventDefault();
      
      // Use native smooth scroll with offset
      const offset = window.innerWidth >= 768 ? 64 : 56;
      const elementPosition = element.offsetTop - offset;
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    };

    // Attach to existing anchor links
    const anchors = document.querySelectorAll<HTMLAnchorElement>('a[href^="#"], a[href^="/#"]');
    anchors.forEach(anchor => {
      anchor.addEventListener('click', handleAnchorClick);
    });

    return () => {
      // Cleanup
      anchors.forEach(anchor => {
        anchor.removeEventListener('click', handleAnchorClick);
      });
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return <>{children}</>;
}
