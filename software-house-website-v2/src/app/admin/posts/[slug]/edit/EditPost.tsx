"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import type { BlogArticle } from "@/lib/types";
import { getAdminKey, listBlogPosts, updateBlogPost } from "@/lib/admin";
import PostForm from "@/components/admin/PostForm";

function EditPostInner({ slug }: { slug: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [post, setPost] = useState<BlogArticle | undefined>();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getAdminKey()) {
      router.replace("/admin");
      return;
    }
    listBlogPosts()
      .then((posts) => {
        const found = posts.find((p) => p.slug === slug);
        if (!found) router.replace("/admin/posts");
        else setPost(found);
      })
      .catch(() => setError("Failed to load post."));
  }, [router, slug]);

  async function handleSubmit(updated: BlogArticle) {
    const res = await updateBlogPost(slug, updated);
    if (res.slug !== slug) router.replace(`/admin/posts/${res.slug}/edit`);
  }

  if (error) {
    return (
      <p className="text-sm" style={{ color: "#EF4444" }}>
        {error}
      </p>
    );
  }

  if (!post) {
    return (
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        Loading post...
      </p>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">
            <span className="gradient-text">Edit Post</span>
          </h1>
          <Link href="/admin/posts" className="text-sm font-semibold gradient-text">
            &larr; Back to posts
          </Link>
        </div>

        {searchParams.get("created") === "1" && (
          <p
            className="text-sm font-medium mb-6 px-4 py-3 rounded-lg"
            style={{ background: "var(--bg-surface)", border: "1px solid #22C55E", color: "#22C55E" }}
          >
            Post created successfully. You can continue editing or leave it as is.
          </p>
        )}

        <PostForm
          initial={post}
          submitLabel="Save Changes"
          onCancel={() => router.push("/admin/posts")}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}

export default function EditPost({ slug }: { slug: string }) {
  return (
    <Suspense fallback={null}>
      <EditPostInner slug={slug} />
    </Suspense>
  );
}
