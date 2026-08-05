import type { Metadata } from "next";
import AdminLogin from "./AdminLogin";

export const metadata: Metadata = { title: "Admin Login", robots: { index: false } };

export default function AdminPage() {
  return <AdminLogin />;
}
