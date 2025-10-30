// src/app/(viewer)/project/[slug]/not-found.tsx
export default function NotFound() {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold mb-2">Project tidak ditemukan</h1>
        <p className="opacity-70">Project mungkin belum dipublikasikan atau URL salah.</p>
      </div>
    );
  }