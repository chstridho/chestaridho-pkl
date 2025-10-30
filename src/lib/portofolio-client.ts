// src/lib/portfolio-client.ts
import { requestJSON } from './http';

export type Portfolio = {
  id: string; slug: string; title: string; description: string;
  cover_path: string; techs: string[]; repo_url: string | null; demo_url: string | null;
  year: number; featured: boolean; published: boolean;
  created_at: string; updated_at: string; published_at: string | null;
};

function qs(params: Record<string, unknown>) {
  const u = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v) !== '') u.set(k, String(v));
  });
  const s = u.toString();
  return s ? `?${s}` : '';
}

export async function listPortfolio(opts: {
  q?: string; limit?: number; page?: number; featured?: boolean; year?: number; includeDrafts?: boolean;
} = {}) {
  return requestJSON<{ data: Portfolio[]; meta: { page: number; limit: number; total: number } }>(
    `/api/portfolio${qs(opts)}`
  );
}

export async function getPortfolio(idOrSlug: string) {
  return requestJSON<{ data: Portfolio }>(`/api/portfolio/${idOrSlug}`);
}

export async function createPortfolio(form: FormData) {
  return requestJSON<{ data: Portfolio }>(`/api/portfolio`, { method: 'POST', body: form });
}

export async function updatePortfolio(id: string, form: FormData) {
  return requestJSON<{ data: Portfolio }>(`/api/portfolio/${id}`, { method: 'PATCH', body: form });
}

export async function deletePortfolio(id: string) {
  return requestJSON<{ success: boolean }>(`/api/portfolio/${id}`, { method: 'DELETE' });
}