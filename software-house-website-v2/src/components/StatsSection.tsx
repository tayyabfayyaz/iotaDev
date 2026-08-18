const stats = [
  { num: "15+", label: "Projects Delivered" },
  { num: "3+", label: "Happy Clients" },
  { num: "1+", label: "Years in Business" },
  { num: "1+", label: "Team Members" },
];

import Reveal from "./Reveal";

export default function StatsSection() {
  return (
    <section style={{ background: "var(--bg-surface)" }}>
      <div className="max-w-6xl mx-auto px-6 py-16">
        <Reveal className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-4xl md:text-5xl font-extrabold gradient-text">{s.num}</div>
              <div className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>{s.label}</div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
