import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import SectionHeading from "@/components/SectionHeading";
import CtaSection from "@/components/CtaSection";
import StatsSection from "@/components/StatsSection";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <PageHeader title="About iotaDev" description="We're on a mission to help businesses harness technology for real, measurable impact." />

      <StatsSection />

      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                <span className="gradient-text">Our Story</span>
              </h2>
              <div className="space-y-4" style={{ color: "var(--text-secondary)" }}>
                <p className="leading-relaxed">
                  Founded in 2020, iotaDev began with a simple belief: technology should serve business goals, not the
                  other way around. We saw too many companies investing in complex solutions that didn't deliver real value.
                </p>
                <p className="leading-relaxed">
                  What started as a two-person consultancy has grown into a team of passionate engineers, architects, and AI
                  specialists who have delivered projects for startups and Fortune 500 companies alike.
                </p>
                <p className="leading-relaxed">
                  Every project we take on is guided by three principles: technical excellence, business alignment, and
                  long-term partnership. We don't just deliver code — we deliver outcomes.
                </p>
              </div>
            </div>
            <div
              className="h-[400px] rounded-xl flex items-center justify-center text-6xl font-bold"
              style={{
                background: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(6,182,212,0.15))",
              }}
            >
              <span className="gradient-text">iota</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeading title="Our Values" subtitle="The principles that guide every decision we make." />
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Excellence", desc: "We hold ourselves to the highest standards of quality in every line of code and every client interaction." },
              { title: "Partnership", desc: "We don't just build for you — we build with you. Your success is our success." },
              { title: "Impact", desc: "Every project must deliver measurable business value. We focus on outcomes, not outputs." },
            ].map((v) => (
              <div
                key={v.title}
                className="gradient-border rounded-xl p-8"
                style={{ background: "var(--bg-card)" }}
              >
                <h3 className="text-xl font-bold mb-3">{v.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaSection title="Want to Learn More?" description="Let's talk about how we can help your business grow." />
    </>
  );
}
