import type { Metadata } from "next";
import AdminPosts from "./AdminPosts";

export const metadata: Metadata = { title: "Admin — Posts", robots: { index: false } };

export default function AdminPostsPage() {
  return <AdminPosts />;
}
