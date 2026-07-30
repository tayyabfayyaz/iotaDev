import Link from "next/link";

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
    <section
      className="py-24 text-center"
      style={{
        background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(6,182,212,0.08))",
      }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">{title}</h2>
        <p className="text-lg mb-8 max-w-lg mx-auto" style={{ color: "var(--text-secondary)" }}>
          {description}
        </p>
        <Link
          href={buttonHref}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-semibold text-white transition-all duration-250 hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
            boxShadow: "0 4px 20px rgba(139, 92, 246, 0.3)",
          }}
        >
          {buttonText}
        </Link>
      </div>
    </section>
  );
}
