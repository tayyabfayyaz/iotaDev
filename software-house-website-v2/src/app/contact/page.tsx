import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <>
      <PageHeader title="Get in Touch" description="Have a project in mind? We'd love to hear from you." />

      <section className="pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            <ContactForm />

            <div>
              <h2 className="text-2xl font-bold mb-6 gradient-text">Contact Info</h2>
              <div className="space-y-6">
                {[
                  { label: "Email", value: "fayyaztayyab684@gmail.com" },
                  { label: "Location", value: "Pakistan" },
                ].map((c) => (
                  <div key={c.label}>
                    <p className="text-sm font-medium mb-1" style={{ color: "var(--text-muted)" }}>
                      {c.label}
                    </p>
                    <p style={{ color: "var(--text-primary)" }}>{c.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
