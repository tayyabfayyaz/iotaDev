import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import ServiceIcon from "@/components/ServiceIcon";
import CtaSection from "@/components/CtaSection";
import ExploreSubServices from "@/components/ExploreSubServices";
import { getServices } from "@/lib/data";

export const metadata: Metadata = { title: "Services" };

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <>
      <PageHeader
        title="Our Services"
        description="We deliver end-to-end digital solutions tailored to your business needs."
      />

      <section className="py-24" style={{ background: "var(--bg-surface)" }}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col gap-10">
          {services.map((s) => (
            <div
              key={s.id}
              id={s.id}
              className="gradient-border rounded-xl p-8 transition-all duration-250"
              style={{ background: "var(--bg-card)" }}
            >
              <div className="flex items-start gap-5">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0"
                  style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(6,182,212,0.15))" }}
                >
                  <ServiceIcon icon={s.icon} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                    <h3 className="text-xl font-bold">{s.title}</h3>
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full shrink-0 self-start sm:self-center" style={{ background: "rgba(139,92,246,0.1)", color: "#A78BFA" }}>
                      {s.subServices ? `${s.subServices.length} sub-services` : "Core service"}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
                    {s.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {s.technologies.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-0.5 text-xs font-medium rounded-full"
                        style={{ background: "rgba(139,92,246,0.1)", color: "#A78BFA" }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <ul className="space-y-1.5 mb-6">
                    {s.features.map((d) => (
                      <li key={d} className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                        <span className="text-secondary shrink-0">&#10003;</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                  {s.subServices ? (
                    <ExploreSubServices subServices={s.subServices} />
                  ) : (
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 text-sm font-semibold gradient-text transition-all duration-200 hover:gap-3"
                    >
                      Get Started &rarr;
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <CtaSection
        title="Need Something Else?"
        description="We take on complex, custom projects. Reach out and let's discuss your needs."
      />
    </>
  );
}
