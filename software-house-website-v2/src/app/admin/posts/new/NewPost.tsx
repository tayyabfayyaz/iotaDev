"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { BlogArticle } from "@/lib/types";
import { getAdminKey, createBlogPost } from "@/lib/admin";
import PostForm from "@/components/admin/PostForm";

export default function NewPost() {
  const router = useRouter();

  useEffect(() => {
    if (!getAdminKey()) router.replace("/admin");
  }, [router]);

  async function handleSubmit(post: BlogArticle) {
    const res = await createBlogPost(post);
    router.replace(`/admin/posts/${res.slug}/edit?created=1`);
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">
            <span className="gradient-text">New Post</span>
          </h1>
          <Link
            href="/admin/posts"
            className="text-sm font-semibold gradient-text"
          >
            &larr; Back to posts
          </Link>
        </div>
        <PostForm submitLabel="Publish Post" onCancel={() => router.push("/admin/posts")} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
