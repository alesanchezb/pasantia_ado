const API_BASE = import.meta.env.VITE_API_URL;

export async function apiGet(url) {
  const res = await fetch(`${API_BASE}${url}`);
  if (!res.ok) throw new Error("API error");
  return res.json();
}
