import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import CtaSection from "@/components/CtaSection";
import TestimonialForm from "@/components/TestimonialForm";
import { getTestimonials } from "@/lib/data";

export const metadata: Metadata = { title: "Testimonials" };

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials();
  return (
    <>
      <PageHeader title="Client Testimonials" description="Don't take our word for it — hear from the companies we've partnered with." />

      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="gradient-border rounded-2xl p-8"
                style={{ background: "var(--bg-card)" }}
              >
                <p
                  className="italic leading-relaxed mb-8 text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <span
                    className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ background: "linear-gradient(135deg, rgba(124,108,255,0.2), rgba(45,212,191,0.2))" }}
                  >
                    <span className="gradient-text">{t.clientName.charAt(0)}</span>
                  </span>
                  <div>
                    <p className="font-semibold text-sm">{t.clientName}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {t.role}, {t.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24" style={{ background: "var(--bg-surface)" }}>
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-10">
            <span className="badge mb-4">
              <span className="badge-dot" />
              Share Your Experience
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">Worked with us?</h2>
            <p className="text-base" style={{ color: "var(--text-secondary)" }}>
              We'd love to hear your feedback. Submissions are reviewed before they appear on the site.
            </p>
          </div>
          <div className="gradient-border rounded-2xl p-6 md:p-8" style={{ background: "var(--bg-card)" }}>
            <TestimonialForm />
          </div>
        </div>
      </section>

      <CtaSection title="Be Our Next Success Story" description="Let's create something great together." buttonText="Get Started" />
    </>
  );
}
