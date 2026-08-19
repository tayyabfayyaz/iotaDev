export interface SubService {
  id: string;
  title: string;
  tagline: string;
  description: string;
  icon: string;
  image: string;
  keyPoints: string[];
  technologies: string[];
}

export interface Service {
  id: string;
  title: string;
  tagline: string;
  description: string;
  icon: string;
  technologies: string[];
  features: string[];
  subServices?: SubService[];
}

export interface PortfolioItem {
  id: string;
  title: string;
  client: string;
  summary: string;
  challenge: string;
  solution: string;
  outcome: string;
  technologies: string[];
  image: string;
  featured: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  photo: string;
  bio: string;
  social: { linkedin: string; twitter: string };
}

export interface Testimonial {
  id: string;
  quote: string;
  clientName: string;
  company: string;
  role: string;
  logo: string;
  approved?: number;
  timestamp?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface BlogArticle {
  title: string;
  slug: string;
  date: string;
  author: string;
  excerpt: string;
  content: string;
  tags: string[];
  featuredImage: string;
}
