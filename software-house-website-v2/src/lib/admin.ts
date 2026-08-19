import type { BlogArticle, Testimonial } from "./types";

const ADMIN_KEY_STORAGE = "iotadev-admin-key";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export function getAdminKey(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(ADMIN_KEY_STORAGE) || "";
}

export function setAdminKey(key: string): void {
  sessionStorage.setItem(ADMIN_KEY_STORAGE, key);
}

export function clearAdminKey(): void {
  sessionStorage.removeItem(ADMIN_KEY_STORAGE);
}

export function isAuthenticated(): boolean {
  return Boolean(getAdminKey());
}

export async function verifyAdminKey(key: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/admin/blog`, {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function adminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
    "Content-Type": "application/json",
    Authorization: `Bearer ${getAdminKey()}`,
  };
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    throw new Error(detail?.detail || `Request failed (${res.status})`);
  }
  return res.json();
}

export function listBlogPosts(): Promise<BlogArticle[]> {
  return adminFetch<BlogArticle[]>("/api/admin/blog");
}

export function createBlogPost(post: BlogArticle): Promise<{ success: boolean; slug: string }> {
  return adminFetch<{ success: boolean; slug: string }>("/api/admin/blog", {
    method: "POST",
    body: JSON.stringify(post),
  });
}

export function updateBlogPost(slug: string, post: BlogArticle): Promise<{ success: boolean; slug: string }> {
  return adminFetch<{ success: boolean; slug: string }>(`/api/admin/blog/${slug}`, {
    method: "PUT",
    body: JSON.stringify(post),
  });
}

export function deleteBlogPost(slug: string): Promise<{ success: boolean; slug: string }> {
  return adminFetch<{ success: boolean; slug: string }>(`/api/admin/blog/${slug}`, {
    method: "DELETE",
  });
}

export function listTestimonials(): Promise<Testimonial[]> {
  return adminFetch<Testimonial[]>("/api/admin/testimonials");
}

export function approveTestimonial(id: string): Promise<{ success: boolean }> {
  return adminFetch<{ success: boolean }>(`/api/admin/testimonials/${id}/approve`, {
    method: "POST",
  });
}

export function rejectTestimonial(id: string): Promise<{ success: boolean }> {
  return adminFetch<{ success: boolean }>(`/api/admin/testimonials/${id}`, {
    method: "DELETE",
  });
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
