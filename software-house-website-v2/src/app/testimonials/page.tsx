import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import CtaSection from "@/components/CtaSection";
import { getTestimonials } from "@/lib/data";

export const metadata: Metadata = { title: "Testimonials" };

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials();
  return (
    <>
      <PageHeader title="Client Testimonials" description="Don't take our word for it \u2014 hear from the companies we've partnered with." />

      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t.id} className="bg-white rounded-xl p-10 shadow-sm border border-gray-200 text-center">
                <p className="text-gray-500 italic leading-relaxed mb-8 relative before:content-['\201C'] before:text-6xl before:text-accent before:opacity-30 before:absolute before:-top-6 before:-left-3 before:font-serif">
                  {t.quote}
                </p>
                <p className="font-semibold text-gray-900">{t.clientName}</p>
                <p className="text-sm text-gray-400">{t.role}, {t.company}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaSection title="Be Our Next Success Story" description="Let's create something great together." buttonText="Get Started" />
    </>
  );
}
