import * as api from "./api";
import type { Service, PortfolioItem, TeamMember, Testimonial, FAQItem, BlogArticle } from "./types";

export async function getServices(): Promise<Service[]> {
  return api.getServices();
}

export async function getServiceBySlug(slug: string): Promise<Service | undefined> {
  const services = await getServices();
  return services.find((s) => s.id === slug);
}

export async function getPortfolioItems(featured?: boolean): Promise<PortfolioItem[]> {
  return api.getPortfolio(featured);
}

export async function getPortfolioItem(id: string): Promise<PortfolioItem | undefined> {
  try {
    return await api.getPortfolioItem(id);
  } catch {
    return undefined;
  }
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  return api.getTeam();
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return api.getTestimonials();
}

export async function getFaqItems(): Promise<FAQItem[]> {
  return api.getFaq();
}

export async function getBlogArticles(): Promise<BlogArticle[]> {
  return api.getBlogArticles();
}

export async function getBlogArticle(slug: string): Promise<BlogArticle | undefined> {
  try {
    return await api.getBlogArticle(slug);
  } catch {
    return undefined;
  }
}
