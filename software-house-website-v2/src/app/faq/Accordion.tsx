"use client";

import { useState } from "react";

interface FaqItem {
  id?: string;
  question: string;
  answer: string;
}

interface Props {
  items: FaqItem[];
}

export default function Accordion({ items }: Props) {
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const isOpen = openId === i;
        return (
          <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setOpenId(isOpen ? null : i)}
              className="flex items-center justify-between w-full p-5 bg-white font-semibold text-left cursor-pointer hover:bg-gray-50 transition-colors duration-150"
            >
              {item.question}
              <span className={`text-secondary transition-transform duration-250 ${isOpen ? "rotate-180" : ""}`}>
                {'\u25BC'}
              </span>
            </button>
            <div
              className="overflow-hidden transition-all duration-350"
              style={{ maxHeight: isOpen ? "500px" : "0" }}
            >
              <div className="px-5 pb-5 text-gray-500 leading-relaxed">{item.answer}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
