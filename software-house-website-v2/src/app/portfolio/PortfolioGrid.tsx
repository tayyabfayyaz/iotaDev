"use client";

import { useState } from "react";
import type { PortfolioItem } from "@/lib/types";

interface Props {
  items: PortfolioItem[];
}

export default function PortfolioGrid({ items }: Props) {
  const [selected, setSelected] = useState<PortfolioItem | null>(null);

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelected(p)}
            className="gradient-border rounded-2xl overflow-hidden text-left transition-all duration-250 hover:-translate-y-1 cursor-pointer"
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
                {p.technologies.map((t) => (
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
          </button>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
          style={{ background: "rgba(0,0,0,0.6)" }}
        >
          <div
            className="rounded-2xl max-w-lg w-full p-8 relative"
            onClick={(e) => e.stopPropagation()}
            style={{ background: "var(--bg-card)" }}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-xl leading-none cursor-pointer"
              style={{ color: "var(--text-secondary)" }}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-1">{selected.title}</h2>
            <p style={{ color: "var(--text-muted)" }} className="text-sm mb-4">
              {selected.client}
            </p>
            <p className="leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
              {selected.summary}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {selected.technologies.map((t) => (
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
        </div>
      )}
    </>
  );
}
