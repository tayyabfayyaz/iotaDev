import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import SectionHeading from "@/components/SectionHeading";
import CtaSection from "@/components/CtaSection";
import { getTeamMembers } from "@/lib/data";

export const metadata: Metadata = { title: "Team" };

export const revalidate = 60;

export default async function TeamPage() {
  const teamMembers = await getTeamMembers();
  return (
    <>
      <PageHeader title="Our Team" description="Meet the founder behind iotaDev." />

      <section className="pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-center">
            <div className="w-full max-w-sm">
              {teamMembers.map((m) => (
                <div
                  key={m.id}
                  className="gradient-border rounded-2xl overflow-hidden transition-all duration-250 hover:-translate-y-1"
                  style={{ background: "var(--bg-card)" }}
                >
                  <div
                    className="h-48 flex items-center justify-center text-6xl"
                    style={{ background: "linear-gradient(135deg, rgba(124,108,255,0.15), rgba(45,212,191,0.15))" }}
                  >
                    <span className="gradient-text">{m.name.charAt(0)}</span>
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="text-xl font-bold">{m.name}</h3>
                    <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>
                      {m.role}
                    </p>
                    <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
                      {m.bio}
                    </p>
                    {m.social.linkedin !== "#" && (
                      <a
                        href={m.social.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity"
                        style={{ color: "var(--accent)" }}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CtaSection title="Join Our Team" description="We're always looking for talented people. Check our open positions." buttonText="View Openings" />
    </>
  );
}
