import type { Metadata } from "next";
import AdminTestimonials from "./AdminTestimonials";

export const metadata: Metadata = { title: "Testimonials", robots: { index: false } };

export default function AdminTestimonialsPage() {
  return <AdminTestimonials />;
}
