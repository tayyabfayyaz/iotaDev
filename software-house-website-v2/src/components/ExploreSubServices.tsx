"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import type { SubService } from "@/lib/types";
import ServiceIcon from "./ServiceIcon";

function SubServiceCard({ sub }: { sub: SubService }) {
  return (
    <div
      className="gradient-border rounded-xl overflow-hidden transition-all duration-250 hover:-translate-y-1 flex flex-col"
      style={{ background: "var(--bg-card)" }}
    >
      <div className="h-44 overflow-hidden">
        <img
          src={sub.image}
          alt={sub.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
            style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(6,182,212,0.15))" }}
          >
            <ServiceIcon icon={sub.icon} />
          </div>
          <h4 className="text-lg font-bold">{sub.title}</h4>
        </div>
        <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
          {sub.description}
        </p>
        <ul className="space-y-2 mb-5">
          {(sub.keyPoints ?? []).map((kp) => (
            <li key={kp} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              <span className="text-secondary mt-0.5 shrink-0">&#10003;</span>
              {kp}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-1.5 mb-5">
          {(sub.technologies ?? []).map((t) => (
            <span
              key={t}
              className="px-2.5 py-0.5 text-xs font-medium rounded-full"
              style={{ background: "rgba(139,92,246,0.1)", color: "#A78BFA" }}
            >
              {t}
            </span>
          ))}
        </div>
        <Link
          href="/contact"
          className="mt-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-250 hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
          }}
        >
          Get Started &rarr;
        </Link>
      </div>
    </div>
  );
}

export default function ExploreSubServices({ subServices }: { subServices: SubService[] }) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [open]);

  return (
    <div className="mt-auto">
      <button
        onClick={() => setOpen(!open)}
        className="group flex items-center gap-2 text-sm font-semibold gradient-text cursor-pointer transition-all duration-200 hover:gap-3"
      >
        {open ? "Hide Sub-Services" : "Explore Sub-Services"}
        <span className={`inline-block transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          &#9660;
        </span>
      </button>

      <div
        className="overflow-hidden transition-all duration-400 ease-in-out"
        style={{ maxHeight: open ? height : 0, opacity: open ? 1 : 0 }}
      >
        <div ref={contentRef}>
          <div className="pt-8 pb-4">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px flex-1" style={{ background: "var(--border)" }} />
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                Sub-Services
              </span>
              <div className="h-px flex-1" style={{ background: "var(--border)" }} />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {subServices.map((sub) => (
              <SubServiceCard key={sub.id} sub={sub} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
