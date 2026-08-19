"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import type { BlogArticle } from "@/lib/types";
import { getAdminKey, listBlogPosts, deleteBlogPost, clearAdminKey } from "@/lib/admin";

export default function AdminPosts() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listBlogPosts();
      setPosts(data);
    } catch {
      setError("Failed to load posts. Is the backend running?");
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

  async function handleDelete(slug: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteBlogPost(slug);
      setPosts((prev) => prev.filter((p) => p.slug !== slug));
    } catch {
      setError("Failed to delete post.");
    }
  }

  function handleLogout() {
    clearAdminKey();
    router.replace("/admin");
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              <span className="gradient-text">Blog Posts</span>
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              Manage the articles published on the iotaDev blog
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/testimonials"
              className="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
            >
              Testimonials
            </Link>
            <Link
              href="/admin/posts/new"
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-250 hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #7C6CFF, #2DD4BF)" }}
            >
              + New Post
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
            Loading posts...
          </p>
        ) : posts.length === 0 ? (
          <div className="gradient-border rounded-2xl p-12 text-center" style={{ background: "var(--bg-card)" }}>
            <p className="text-lg font-semibold mb-1">No posts yet</p>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              Publish your first article to get started.
            </p>
            <Link
              href="/admin/posts/new"
              className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #7C6CFF, #2DD4BF)" }}
            >
              Create a post
            </Link>
          </div>
        ) : (
          <div className="gradient-border rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)" }}>
            {posts.map((post, i) => (
              <div
                key={post.slug}
                className="flex flex-wrap items-center gap-4 px-6 py-5"
                style={{ borderTop: i === 0 ? "none" : "1px solid var(--border)" }}
              >
                <div className="flex-1 min-w-0">
                  <Link href={`/blog/${post.slug}`} className="font-semibold hover:underline">
                    {post.title}
                  </Link>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    {post.date} &middot; {post.author}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/posts/${post.slug}/edit`}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150"
                    style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(post.slug, post.title)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150"
                    style={{ background: "var(--bg-surface)", border: "1px solid #EF4444", color: "#EF4444" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
