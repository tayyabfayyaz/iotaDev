import type { ChatMessage } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, { next: { revalidate: 60 } });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

async function safeFetch<T>(url: string, fallback: T): Promise<T> {
  try {
    return await fetchJson<T>(url);
  } catch (e) {
    console.warn(`API unavailable for ${url}:`, (e as Error).message);
    return fallback;
  }
}

export function getServices() {
  return safeFetch<any[]>("/api/services", []);
}

export function getService(id: string) {
  return safeFetch<any>(`/api/services/${id}`, null);
}

export function getPortfolio(featured?: boolean) {
  const qs = featured ? "?featured=true" : "";
  return safeFetch<any[]>(`/api/portfolio${qs}`, []);
}

export function getPortfolioItem(id: string) {
  return safeFetch<any>(`/api/portfolio/${id}`, null);
}

export function getTeam() {
  return safeFetch<any[]>("/api/team", []);
}

export function getTestimonials() {
  return safeFetch<any[]>("/api/testimonials", []);
}

export function getFaq() {
  return safeFetch<any[]>("/api/faq", []);
}

export function getBlogArticles() {
  return safeFetch<any[]>("/api/blog", []);
}

export function getBlogArticle(slug: string) {
  return safeFetch<any>(`/api/blog/${slug}`, null);
}

export interface TestimonialInput {
  quote: string;
  clientName: string;
  company: string;
  role: string;
}

export async function submitTestimonial(input: TestimonialInput): Promise<{ success: boolean }> {
  const res = await fetch("/api/testimonials/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    throw new Error(detail?.detail || `Failed (${res.status})`);
  }
  return res.json();
}

export async function askAgent(message: string, history: ChatMessage[]): Promise<string> {
  const res = await fetch("/api/agent/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    throw new Error(detail?.detail || `Failed (${res.status})`);
  }
  const data = await res.json();
  return data.reply;
}
