import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import PortfolioGrid from "./PortfolioGrid";
import { getPortfolioItems } from "@/lib/data";

export const metadata: Metadata = { title: "Portfolio" };

export default async function PortfolioPage() {
  const portfolioItems = await getPortfolioItems();
  return (
    <>
      <PageHeader title="Our Work" description="A selection of projects we've delivered across industries and technologies." />

      <section className="pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <PortfolioGrid items={portfolioItems} />
        </div>
      </section>
    </>
  );
}
