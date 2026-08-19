import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import ServiceIcon from "@/components/ServiceIcon";
import CtaSection from "@/components/CtaSection";
import TypeWriter from "@/components/TypeWriter";
import StatsSection from "@/components/StatsSection";
import Reveal from "@/components/Reveal";
import OrbitScene from "@/components/OrbitScene";
import TestimonialForm from "@/components/TestimonialForm";
import { getServices, getPortfolioItems, getTestimonials } from "@/lib/data";

export default async function HomePage() {
  const [services, portfolioItems, testimonials] = await Promise.all([
    getServices(),
    getPortfolioItems(true),
    getTestimonials(),
  ]);
  return (
    <>
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <OrbitScene />

        <div className="max-w-6xl mx-auto px-6 relative z-10 w-full pt-32 pb-24">
          <Reveal className="max-w-2xl">
            <span className="badge mb-7">
              <span className="badge-dot" />
              Software House
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.03] tracking-tight mb-6">
              Build the{" "}
              <span className="gradient-text">Future</span>
              <br />
              For your Business
            </h1>
            <div className="text-lg md:text-xl mb-6 h-8" style={{ color: "var(--text-secondary)" }}>
              <TypeWriter
                phrases={[
                  "We build AI-powered web applications.",
                  "We design intelligent automation systems.",
                  "We architect cloud-native solutions.",
                  "We ship production-ready software.",
                ]}
                speed={60}
                pauseDuration={2500}
              />
            </div>
            <p className="text-lg leading-relaxed mb-10 max-w-xl" style={{ color: "var(--text-secondary)" }}>
              We partner with companies to design and build exceptional digital products. From web applications and AI
              solutions to cloud infrastructure — we turn complex challenges into scalable, elegant solutions.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact" className="btn-primary">
                Start a Project
              </Link>
              <Link href="/portfolio" className="btn-ghost">
                View Our Work
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <StatsSection />

      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeading title="What We Do" subtitle="Full-stack software engineering expertise to accelerate your digital transformation." />
          <Reveal className="grid md:grid-cols-3 gap-6">
            {services.map((s) => (
              <Link
                key={s.id}
                href={`/services#${s.id}`}
                className="gradient-border rounded-2xl p-8 transition-all duration-250 hover:-translate-y-1"
                style={{ background: "var(--bg-card)" }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5"
                  style={{ background: "linear-gradient(135deg, rgba(124,108,255,0.15), rgba(45,212,191,0.15))" }}
                >
                  <ServiceIcon icon={s.icon} />
                </div>
                <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {s.tagline}
                </p>
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="py-24" style={{ background: "var(--bg-surface)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeading title="Featured Work" subtitle="Real projects, real results — built with modern technology stacks." />
          <Reveal className="grid md:grid-cols-3 gap-6">
            {portfolioItems.slice(0, 3).map((p) => (
                <Link
                  key={p.id}
                  href="/portfolio"
                  className="gradient-border rounded-2xl overflow-hidden transition-all duration-250 hover:-translate-y-1"
                  style={{ background: "var(--bg-card)" }}
                >
                  <div
                    className="h-48 flex items-center justify-center text-5xl font-bold"
                    style={{ background: "linear-gradient(135deg, rgba(124,108,255,0.2), rgba(45,212,191,0.2))" }}
                  >
                    {p.title.charAt(0)}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-1">{p.title}</h3>
                    <p style={{ color: "var(--text-muted)" }} className="text-sm mb-2">
                      {p.client}
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {p.summary}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {p.technologies.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="px-2.5 py-0.5 text-xs font-medium rounded-full"
                          style={{ background: "rgba(124,108,255,0.1)", color: "#A79BFF" }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
          </Reveal>
          <div className="text-center mt-10">
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-lg font-semibold transition-all duration-250"
              style={{
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            >
              View All Projects &rarr;
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeading title="Client Feedback" subtitle="Trusted by industry leaders to deliver results that matter." />
          <Reveal className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="gradient-border rounded-2xl p-8"
                style={{ background: "var(--bg-card)" }}
              >
                <p
                  className="italic leading-relaxed mb-6 text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  "{t.quote}"
                </p>
                <div>
                  <p className="font-semibold text-sm">{t.clientName}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {t.role}, {t.company}
                  </p>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="py-24" style={{ background: "var(--bg-surface)" }}>
        <div className="max-w-2xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-10">
              <span className="badge mb-4">
                <span className="badge-dot" />
                Share Your Experience
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">Worked with us?</h2>
              <p className="text-base" style={{ color: "var(--text-secondary)" }}>
                Leave a testimonial — it'll be reviewed and featured here.
              </p>
            </div>
            <div className="gradient-border rounded-2xl p-6 md:p-8" style={{ background: "var(--bg-card)" }}>
              <TestimonialForm />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(124,108,255,0.1), rgba(45,212,191,0.1))" }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 gradient-text">Let's Build Together</h2>
            <p className="text-lg mb-8 max-w-lg mx-auto" style={{ color: "var(--text-secondary)" }}>
              Have a project in mind? We'd love to hear about it. Let's discuss how we can help bring your vision to life.
            </p>
            <Link href="/contact" className="btn-primary">
              Get in Touch
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
