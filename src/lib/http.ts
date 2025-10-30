// src/lib/http.ts
export async function requestJSON<T = any>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, init);
    const ct = res.headers.get('content-type') || '';
    const isJSON = ct.includes('application/json');
    const payload = isJSON ? await res.json().catch(() => ({})) : await res.text();
  
    if (!res.ok) {
      const message =
        typeof payload === 'string'
          ? payload.slice(0, 300) // potong jika HTML panjang
          : payload?.error || res.statusText;
      throw new Error(message || `HTTP ${res.status}`);
    }
    return payload as T;
  }