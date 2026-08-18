interface Props {
  title: string;
  description: string;
}

export default function PageHeader({ title, description }: Props) {
  return (
    <section className="pt-36 pb-16 text-center relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--text-primary) 1px, transparent 0)`,
          backgroundSize: "42px 42px",
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[28rem] h-[28rem] rounded-full blur-[120px] opacity-40" style={{ background: "linear-gradient(135deg, rgba(124,108,255,0.5), rgba(45,212,191,0.4))" }} />
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <span className="badge mb-6">
          <span className="badge-dot" />
          iotaDev
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          <span className="gradient-text">{title}</span>
        </h1>
        <p className="text-lg max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
          {description}
        </p>
      </div>
    </section>
  );
}
