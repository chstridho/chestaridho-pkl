'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Press_Start_2P, Manrope } from 'next/font/google';
import { useEffect, useState, useRef } from 'react';
import type { MouseEvent } from 'react';

const pixel = Press_Start_2P({ weight: '400', subsets: ['latin'] });
const manrope = Manrope({ subsets: ['latin'] });

const NAV_ITEMS = [
  { href: '/about', label: 'About' },
  { href: '/project', label: 'Project' },
  { href: '#contact', label: 'Contact' },
];

/* Interactive Nav Link */
function NavLink({ href, label, isActive }: { href: string; label: string; isActive: boolean }) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLAnchorElement>) => {
    const link = linkRef.current;
    if (!link) return;
    
    const rect = link.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <Link
      ref={linkRef}
      href={href}
      onMouseMove={handleMouseMove}
      className={[
        'relative px-4 py-2 text-[16px] lg:text-[17px] font-semibold tracking-wide',
        'text-white/80 hover:text-white transition-all duration-300 group',
        'overflow-hidden rounded-lg',
        isActive ? 'text-white' : '',
      ].join(' ')}
    >
      {/* Interactive gradient follow */}
      <span 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle 80px at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.1), transparent)`,
        }}
      />
      
      {/* Text */}
      <span className="relative z-10">{label}</span>
      
      {/* Creative underline */}
      <span className={[
        'absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-white',
        'transition-all duration-300 ease-out',
        isActive ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100',
      ].join(' ')} />
      
      {/* Glow effect on hover */}
      <span className="absolute inset-x-0 -bottom-1 h-8 bg-gradient-to-t from-blue-500/20 to-transparent 
                     opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 pointer-events-none" />
    </Link>
  );
}

/* Enhanced Mobile Menu Button */
function MenuButton({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="md:hidden relative h-11 w-11 group"
      aria-label="Toggle menu"
      aria-expanded={isOpen}
    >
      {/* Background with hover effect */}
      <span className="absolute inset-0 rounded-xl bg-white/10 group-hover:bg-white/15 
                     transition-all duration-300 group-active:scale-95" />
      
      {/* Animated burger lines */}
      <span className="relative flex flex-col items-center justify-center h-full">
        <span className={[
          'block h-0.5 w-6 bg-white rounded-full transition-all duration-300',
          isOpen ? 'rotate-45 translate-y-[3px]' : '-translate-y-[6px]'
        ].join(' ')} />
        <span className={[
          'block h-0.5 w-6 bg-white rounded-full transition-all duration-300',
          isOpen ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'
        ].join(' ')} />
        <span className={[
          'block h-0.5 w-6 bg-white rounded-full transition-all duration-300',
          isOpen ? '-rotate-45 -translate-y-[3px]' : 'translate-y-[6px]'
        ].join(' ')} />
      </span>
      
      {/* Pulse effect on open */}
      {isOpen && (
        <span className="absolute inset-0 rounded-xl animate-ping bg-white/10" />
      )}
    </button>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);
  
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const isActive = (href: string) => !href.startsWith('#') && pathname === href;

  return (
    <>
      <header
        ref={headerRef}
        className={[
          'fixed inset-x-0 top-0 z-50 transition-all duration-500',
          scrolled
            ? 'backdrop-blur-xl bg-[var(--surface)]/80 ring-1 ring-white/10 shadow-2xl'
            : 'bg-[var(--surface)] ring-0 shadow-none',
        ].join(' ')}
      >
        {/* Abstract background elements */}
        <div className="container-app max-w-5xl md:max-w-6xl h-16 md:h-20 flex items-center justify-between relative">
          {/* Brand with hover effect */}
          <Link
            href="/"
            className="group relative"
          >
            <span className={`${pixel.className} text-[16px] md:text-[18px] text-white/95 
                           hover:text-white transition-all duration-300 relative z-10`}>
              PortoFOLIO.
            </span>
            {/* Glitch effect on hover */}
            <span className={`${pixel.className} absolute inset-0 text-[16px] md:text-[18px] text-blue-400 
                           opacity-0 group-hover:opacity-100 transition-opacity duration-200
                           group-hover:animate-glitch pointer-events-none`}
                  aria-hidden="true">
              PortoFOLIO.
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className={`hidden md:flex items-center gap-2 ${manrope.className}`}>
            {NAV_ITEMS.map((item) => (
              <NavLink 
                key={item.href} 
                href={item.href} 
                label={item.label} 
                isActive={isActive(item.href)} 
              />
            ))}
          </nav>

          {/* Mobile menu button */}
          <MenuButton isOpen={open} onClick={() => setOpen(!open)} />
        </div>
      </header>

      {/* Enhanced Mobile Drawer */}
      <div className={`md:hidden fixed inset-0 z-40 pointer-events-none`}>
        {/* Backdrop */}
        <div 
          className={[
            'absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
            open ? 'opacity-100 pointer-events-auto' : 'opacity-0'
          ].join(' ')}
          onClick={() => setOpen(false)}
        />
        
        {/* Drawer Panel */}
        <div className={[
          'absolute top-0 right-0 h-full w-[300px] max-w-[85vw]',
          'bg-gradient-to-br from-[var(--surface)] to-neutral-900/95 backdrop-blur-2xl',
          'border-l border-white/10 shadow-2xl',
          'transition-transform duration-500 ease-out pointer-events-auto',
          open ? 'translate-x-0' : 'translate-x-full'
        ].join(' ')}>
          
          {/* Abstract decoration - removed purple orb */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
          </div>
          
          {/* Content */}
          <div className="relative h-full flex flex-col p-6 pt-20">
            <nav className={`flex flex-col gap-2 ${manrope.className}`}>
              {NAV_ITEMS.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    'relative px-4 py-3 text-[18px] font-semibold rounded-xl',
                    'text-white/80 hover:text-white hover:bg-white/10',
                    'transition-all duration-300 transform hover:translate-x-2',
                    'overflow-hidden group',
                    isActive(item.href) ? 'bg-white/10 text-white' : '',
                  ].join(' ')}
                  style={{
                    animation: open ? `slideInRight 0.5s ease-out forwards` : '',
                    animationDelay: `${index * 100}ms`,
                    opacity: 0,
                  }}
                >
                  {/* Hover gradient */}
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 
                                 translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                  <span className="relative">{item.label}</span>
                </Link>
              ))}
            </nav>
            
            {/* Copyright */}
            <div className="mt-auto text-center pb-4">
              <p className={`${manrope.className} text-white/60 text-sm`}>
                © 2025 Chesta Ridho
              </p>
              <p className={`${manrope.className} text-white/40 text-xs mt-1`}>
                All rights reserved
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}