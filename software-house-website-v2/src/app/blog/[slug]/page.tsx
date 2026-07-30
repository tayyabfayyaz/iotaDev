import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogArticle, getBlogArticles } from "@/lib/data";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const articles = await getBlogArticles();
  return articles.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogArticle(slug);
  if (!post) return {};
  return { title: post.title };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogArticle(slug);
  if (!post) notFound();

  return (
    <>
      <section className="pt-32 pb-8 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, var(--text-primary) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
            {post.date} &middot; {post.author}
          </p>
          <h1 className="text-4xl font-bold mb-4">
            <span className="gradient-text">{post.title}</span>
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {post.excerpt}
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-3xl mx-auto px-6">
          <div
            className="prose prose-lg max-w-none leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="mt-12 pt-8" style={{ borderTop: "1px solid var(--border)" }}>
            <Link
              href="/blog"
              className="text-sm font-semibold gradient-text"
            >
              &larr; Back to Blog
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
