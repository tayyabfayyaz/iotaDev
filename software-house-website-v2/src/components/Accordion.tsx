"use client";

import { useState } from "react";

interface Item {
  question: string;
  answer: string;
}

interface Props {
  items: Item[];
}

export default function Accordion({ items }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={i}
            className="gradient-border rounded-2xl overflow-hidden transition-all duration-200"
            style={{ background: "var(--bg-card)" }}
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer"
            >
              <span className="font-semibold">{item.question}</span>
              <span
                className="text-lg transition-transform duration-200"
                style={{ transform: isOpen ? "rotate(45deg)" : "none", color: "var(--text-secondary)" }}
              >
                +
              </span>
            </button>
            <div
              className="overflow-hidden transition-all duration-250"
              style={{
                maxHeight: isOpen ? 300 : 0,
                opacity: isOpen ? 1 : 0,
              }}
            >
              <div className="px-6 pb-5 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {item.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
