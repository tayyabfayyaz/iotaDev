import Reveal from "./Reveal";

interface Props {
  title: string;
  subtitle?: string;
}

export default function SectionHeading({ title, subtitle }: Props) {
  return (
    <Reveal className="mb-14 text-center">
      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
        <span className="gradient-text">{title}</span>
      </h2>
      {subtitle && (
        <p className="text-lg max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
