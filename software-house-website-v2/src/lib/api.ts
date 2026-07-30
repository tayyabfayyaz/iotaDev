const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, { next: { revalidate: 60 } });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export function getServices() {
  return fetchJson<any[]>("/api/services");
}

export function getService(id: string) {
  return fetchJson<any>(`/api/services/${id}`);
}

export function getPortfolio(featured?: boolean) {
  const qs = featured ? "?featured=true" : "";
  return fetchJson<any[]>(`/api/portfolio${qs}`);
}

export function getPortfolioItem(id: string) {
  return fetchJson<any>(`/api/portfolio/${id}`);
}

export function getTeam() {
  return fetchJson<any[]>("/api/team");
}

export function getTestimonials() {
  return fetchJson<any[]>("/api/testimonials");
}

export function getFaq() {
  return fetchJson<any[]>("/api/faq");
}

export function getBlogArticles() {
  return fetchJson<any[]>("/api/blog");
}

export function getBlogArticle(slug: string) {
  return fetchJson<any>(`/api/blog/${slug}`);
}
