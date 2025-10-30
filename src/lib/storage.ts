// src/lib/storage.ts
export function publicStorageUrl(path: string) {
    if (!path) return '';
    // Jika sudah URL penuh, kembalikan apa adanya
    if (/^https?:\/\//i.test(path)) return path;
  
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const BUCKET = process.env.NEXT_PUBLIC_BUCKET_PORTFOLIO || 'portfolio';
  
    // Normalisasi: hapus leading slash
    let key = path.replace(/^\/+/, '');
  
    // Kalau ada prefix 'portfolio/' atau 'portofolio/' di cover_path lama, buang prefix itu
    key = key.replace(/^(portfolio|portofolio)\//, '');
  
    // URL publik final
    return `${base}/storage/v1/object/public/${BUCKET}/${key}`;
  }