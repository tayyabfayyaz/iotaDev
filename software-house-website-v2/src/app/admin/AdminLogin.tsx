"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, FormEvent, useEffect } from "react";
import { getAdminKey, setAdminKey, verifyAdminKey } from "@/lib/admin";

export default function AdminLogin() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");

  useEffect(() => {
    if (getAdminKey()) router.replace("/admin/posts");
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = key.trim();
    if (!trimmed) return;
    setStatus("loading");
    setError("");
    const ok = await verifyAdminKey(trimmed);
    if (ok) {
      setAdminKey(trimmed);
      router.replace("/admin/posts");
      return;
    }
    setStatus("idle");
    setError("Access denied. Invalid admin key.");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="gradient-border rounded-2xl p-8" style={{ background: "var(--bg-card)" }}>
          <div className="text-center mb-8">
            <img src="/logo.svg" alt="iotaDev" className="h-10 w-auto mx-auto mb-4" />
            <h1 className="text-2xl font-bold">
              <span className="gradient-text">Admin Panel</span>
            </h1>
            <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
              Sign in to manage blog posts
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="admin-key"
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Admin Key
              </label>
              <input
                id="admin-key"
                type="password"
                autoFocus
                required
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Enter your shared admin key"
                className="w-full px-4 py-3 rounded-lg transition-colors duration-150"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              />
            </div>

            {error && (
              <p className="text-sm" style={{ color: "#EF4444" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full px-8 py-3 rounded-lg font-semibold text-white transition-all duration-250 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #7C6CFF, #2DD4BF)" }}
            >
              {status === "loading" ? "Checking..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-6">
          <Link href="/" className="gradient-text font-semibold">
            &larr; Back to website
          </Link>
        </p>
      </div>
    </div>
  );
}
