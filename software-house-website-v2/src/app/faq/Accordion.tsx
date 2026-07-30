"use client";

import { useState } from "react";
import { faqItems } from "@/lib/data";

export default function Accordion() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      {faqItems.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setOpenId(isOpen ? null : item.id)}
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
