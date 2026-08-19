"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import type { Testimonial } from "@/lib/types";
import { getAdminKey, listTestimonials, approveTestimonial, rejectTestimonial, clearAdminKey } from "@/lib/admin";

export default function AdminTestimonials() {
  const router = useRouter();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setItems(await listTestimonials());
    } catch {
      setError("Failed to load testimonials. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!getAdminKey()) {
      router.replace("/admin");
      return;
    }
    load();
  }, [router, load]);

  async function handleApprove(id: string) {
    try {
      await approveTestimonial(id);
      setItems((prev) => prev.map((t) => (t.id === id ? { ...t, approved: 1 } : t)));
    } catch {
      setError("Failed to approve testimonial.");
    }
  }

  async function handleReject(id: string) {
    if (!window.confirm("Delete this testimonial? This cannot be undone.")) return;
    try {
      await rejectTestimonial(id);
      setItems((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError("Failed to delete testimonial.");
    }
  }

  function handleLogout() {
    clearAdminKey();
    router.replace("/admin");
  }

  const pending = items.filter((t) => !t.approved);
  const approved = items.filter((t) => t.approved === 1);

  function Card({ t }: { t: Testimonial }) {
    const isPending = !t.approved;
    return (
      <div className="gradient-border rounded-2xl p-6" style={{ background: "var(--bg-card)" }}>
        <p className="italic text-sm leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
          &ldquo;{t.quote}&rdquo;
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-sm">{t.clientName}</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {t.role ? `${t.role}, ` : ""}{t.company}
            </p>
          </div>
          {isPending ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleApprove(t.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors duration-150"
                style={{ background: "linear-gradient(135deg, #7C6CFF, #2DD4BF)" }}
              >
                Approve
              </button>
              <button
                onClick={() => handleReject(t.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150"
                style={{ background: "var(--bg-surface)", border: "1px solid #EF4444", color: "#EF4444" }}
              >
                Reject
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: "rgba(52,211,153,0.12)", color: "var(--color-success)" }}>
                Live
              </span>
              <button
                onClick={() => handleReject(t.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150"
                style={{ background: "var(--bg-surface)", border: "1px solid #EF4444", color: "#EF4444" }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              <span className="gradient-text">Testimonials</span>
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              Review and approve customer testimonials
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/posts"
              className="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
            >
              Blog Posts
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
            >
              Log out
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm mb-4" style={{ color: "#EF4444" }}>
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Loading testimonials...
          </p>
        ) : (
          <>
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>
              Pending review ({pending.length})
            </h2>
            {pending.length === 0 ? (
              <div className="gradient-border rounded-2xl p-8 text-center mb-10" style={{ background: "var(--bg-card)" }}>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  No pending testimonials.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-5 mb-10">
                {pending.map((t) => (
                  <Card key={t.id} t={t} />
                ))}
              </div>
            )}

            <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>
              Live ({approved.length})
            </h2>
            {approved.length === 0 ? (
              <div className="gradient-border rounded-2xl p-8 text-center" style={{ background: "var(--bg-card)" }}>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  No approved testimonials yet.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-5">
                {approved.map((t) => (
                  <Card key={t.id} t={t} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
