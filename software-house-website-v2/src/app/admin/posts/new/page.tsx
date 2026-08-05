import type { Metadata } from "next";
import NewPost from "./NewPost";

export const metadata: Metadata = { title: "Admin — New Post", robots: { index: false } };

export default function NewPostPage() {
  return <NewPost />;
}
