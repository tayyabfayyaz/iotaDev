import Link from "next/link";
import Reveal from "./Reveal";

interface Props {
  title: string;
  description: string;
  buttonText?: string;
  buttonHref?: string;
}

export default function CtaSection({
  title,
  description,
  buttonText = "Get in Touch",
  buttonHref = "/contact",
}: Props) {
  return (
    <section className="py-24 text-center relative overflow-hidden">
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(124,108,255,0.12), rgba(45,212,191,0.12))" }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-[120px] opacity-50" style={{ background: "rgba(124,108,255,0.35)" }} />
      <Reveal className="max-w-6xl mx-auto px-6 relative z-10">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
          <span className="gradient-text">{title}</span>
        </h2>
        <p className="text-lg mb-8 max-w-lg mx-auto" style={{ color: "var(--text-secondary)" }}>
          {description}
        </p>
        <Link href={buttonHref} className="btn-primary">
          {buttonText}
        </Link>
      </Reveal>
    </section>
  );
}
