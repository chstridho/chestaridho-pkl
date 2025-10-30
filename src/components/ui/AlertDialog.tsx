'use client';

import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';

type Props = {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

export default function AlertDialog({
  open,
  title = 'Hapus Project?',
  description = 'Aksi ini permanen. Data dan gambar cover akan dihapus dari Storage.',
  confirmText = 'Ya, hapus',
  cancelText = 'Batal',
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const activeBeforeOpen = useRef<Element | null>(null);

  // Mount di client agar createPortal aman
  useEffect(() => setMounted(true), []);

  // Lock scroll + fokus panel saat open
  useEffect(() => {
    if (!open) return;
    activeBeforeOpen.current = document.activeElement;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    const id = requestAnimationFrame(() => panelRef.current?.focus());
    return () => {
      document.documentElement.style.overflow = prev;
      cancelAnimationFrame(id);
      if (activeBeforeOpen.current instanceof HTMLElement) {
        activeBeforeOpen.current?.focus();
      }
    };
  }, [open]);

  // Trap esc
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open || !mounted) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      {/* Overlay + blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-5 ring-1 ring-white/15 text-white shadow-2xl"
      >
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-white/85">{description}</p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-full bg-white/10 px-4 py-2 text-sm text-white ring-1 ring-white/20 hover:bg-white/15 transition disabled:opacity-60"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-full bg-red-500/85 px-4 py-2 text-sm text-white ring-1 ring-white/10 hover:bg-red-500 transition disabled:opacity-60"
          >
            {loading ? 'Menghapus…' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}