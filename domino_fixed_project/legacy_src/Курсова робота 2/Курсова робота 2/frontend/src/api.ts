export const API = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';
export async function api(path: string, opts: RequestInit = {}){
  const r = await fetch(`${API}${path}`, {headers:{'Content-Type':'application/json'}, ...opts});
  if(!r.ok) throw new Error(await r.text());
  return r.json();
}
