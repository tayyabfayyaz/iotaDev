import type { Metadata } from "next";
import EditPost from "./EditPost";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Admin — Edit ${slug}`, robots: { index: false } };
}

export default async function EditPostPage({ params }: Props) {
  const { slug } = await params;
  return <EditPost slug={slug} />;
}
