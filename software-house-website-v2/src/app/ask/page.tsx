import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import AgentChat from "@/components/AgentChat";

export const metadata: Metadata = { title: "Ask iota" };

export default function AskPage() {
  return (
    <>
      <PageHeader
        title="Ask iota"
        description="Have a question about our services, process, or technology? Chat with iota — iotaDev's AI assistant."
      />

      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-6">
          <AgentChat height="480px" />
          <p className="text-center text-sm mt-6" style={{ color: "var(--text-muted)" }}>
            Need a human? Visit the{" "}
            <a href="/contact" className="gradient-text font-semibold">
              contact page
            </a>{" "}
            and we'll get back to you.
          </p>
        </div>
      </section>
    </>
  );
}
