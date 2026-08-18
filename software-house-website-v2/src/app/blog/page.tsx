import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { getBlogArticles } from "@/lib/data";

export const metadata: Metadata = { title: "Blog" };

export default async function BlogPage() {
  const blogArticles = await getBlogArticles();
  return (
    <>
      <PageHeader title="Our Blog" description="Insights, tutorials, and stories from the iotaDev team." />

      <section className="pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogArticles.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="gradient-border rounded-2xl overflow-hidden transition-all duration-250 hover:-translate-y-1"
                style={{ background: "var(--bg-card)" }}
              >
                <div
                  className="h-44 flex items-center justify-center text-4xl font-bold"
                  style={{ background: "linear-gradient(135deg, rgba(124,108,255,0.15), rgba(45,212,191,0.15))" }}
                >
                  <span className="gradient-text">{post.title.charAt(0)}</span>
                </div>
                <div className="p-6">
                  <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>
                    {post.date}
                  </p>
                  <h3 className="text-lg font-bold mb-2 leading-snug">{post.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-2 mt-4">
                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: "linear-gradient(135deg, rgba(124,108,255,0.2), rgba(45,212,191,0.2))" }}>
                      {post.author.charAt(0)}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{post.author}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
