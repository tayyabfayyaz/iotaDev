"use client";

import { useState, FormEvent, useEffect } from "react";
import type { BlogArticle } from "@/lib/types";
import { slugify } from "@/lib/admin";

interface Props {
  initial?: Partial<BlogArticle>;
  submitLabel: string;
  onSubmit: (post: BlogArticle) => Promise<void>;
  onCancel?: () => void;
}

export default function PostForm({ initial = {}, submitLabel, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState({
    title: initial.title || "",
    slug: initial.slug || "",
    author: initial.author || "",
    date: initial.date || new Date().toISOString().slice(0, 10),
    excerpt: initial.excerpt || "",
    tags: (initial.tags || []).join(", "),
    featuredImage: initial.featuredImage || "",
    content: initial.content || "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "success") {
      const t = setTimeout(() => setStatus("idle"), 2500);
      return () => clearTimeout(t);
    }
  }, [status]);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function generateSlug() {
    set("slug", slugify(form.title));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const post: BlogArticle = {
      slug: slugify(form.slug) || slugify(form.title),
      title: form.title.trim(),
      date: form.date,
      author: form.author.trim(),
      excerpt: form.excerpt.trim(),
      content: form.content,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      featuredImage: form.featuredImage.trim(),
    };
    try {
      await onSubmit(post);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  const inputStyle: React.CSSProperties = {
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    color: "var(--text-primary)",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
            Title *
          </label>
          <input
            id="title"
            required
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            className="w-full px-4 py-3 rounded-lg"
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="slug" className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
            Slug
          </label>
          <div className="flex gap-2">
            <input
              id="slug"
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
              placeholder="auto-from-title"
              className="flex-1 px-4 py-3 rounded-lg"
              style={inputStyle}
            />
            <button
              type="button"
              onClick={generateSlug}
              className="px-3 py-3 rounded-lg text-xs font-medium"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
            >
              Generate
            </button>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-6">
        <div>
          <label htmlFor="author" className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
            Author *
          </label>
          <input
            id="author"
            required
            value={form.author}
            onChange={(e) => set("author", e.target.value)}
            className="w-full px-4 py-3 rounded-lg"
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
            Date *
          </label>
          <input
            id="date"
            type="date"
            required
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
            className="w-full px-4 py-3 rounded-lg"
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="tags" className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
            Tags
          </label>
          <input
            id="tags"
            value={form.tags}
            onChange={(e) => set("tags", e.target.value)}
            placeholder="comma, separated"
            className="w-full px-4 py-3 rounded-lg"
            style={inputStyle}
          />
        </div>
      </div>

      <div>
        <label htmlFor="featuredImage" className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
          Featured Image URL
        </label>
        <input
          id="featuredImage"
          value={form.featuredImage}
          onChange={(e) => set("featuredImage", e.target.value)}
          placeholder="https://..."
          className="w-full px-4 py-3 rounded-lg"
          style={inputStyle}
        />
      </div>

      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
          Excerpt *
        </label>
        <textarea
          id="excerpt"
          required
          rows={3}
          value={form.excerpt}
          onChange={(e) => set("excerpt", e.target.value)}
          className="w-full px-4 py-3 rounded-lg resize-y"
          style={inputStyle}
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
          Content (HTML) *
        </label>
        <textarea
          id="content"
          required
          rows={14}
          value={form.content}
          onChange={(e) => set("content", e.target.value)}
          placeholder={"<p>Write your article in HTML here.</p>\n<h3>Subheading</h3>\n<ul><li>Point one</li></ul>"}
          className="w-full px-4 py-3 rounded-lg resize-y font-mono text-sm"
          style={inputStyle}
        />
      </div>

      <div>
        <p className="text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
          Preview
        </p>
        <div
          className="rounded-lg p-6 prose prose-lg max-w-none leading-relaxed"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          dangerouslySetInnerHTML={{ __html: form.content || "<p class='opacity-50'>Nothing to preview yet.</p>" }}
        />
      </div>

      {status === "success" && (
        <p className="text-sm font-medium" style={{ color: "#22C55E" }}>
          Post saved successfully!
        </p>
      )}
      {status === "error" && (
        <p className="text-sm font-medium" style={{ color: "#EF4444" }}>
          {error || "Failed to save post."}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-8 py-3 rounded-lg font-semibold text-white transition-all duration-250 disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #7C6CFF, #2DD4BF)" }}
        >
          {status === "loading" ? "Saving..." : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-lg font-medium transition-colors duration-150"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
