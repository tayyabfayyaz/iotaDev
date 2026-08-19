"use client";

import { useState, FormEvent } from "react";
import { submitTestimonial } from "@/lib/api";

export default function TestimonialForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [form, setForm] = useState({
    quote: "",
    clientName: "",
    company: "",
    role: "",
  });

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      await submitTestimonial(form);
      setStatus("success");
      setForm({ quote: "", clientName: "", company: "", role: "" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="t-quote" className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
          Your feedback
        </label>
        <textarea
          id="t-quote"
          required
          rows={4}
          placeholder="Tell us about your experience working with iotaDev..."
          value={form.quote}
          onChange={(e) => update("quote", e.target.value)}
          className="w-full px-4 py-3 rounded-lg resize-y transition-colors duration-150"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="t-name" className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
            Your name
          </label>
          <input
            id="t-name"
            required
            value={form.clientName}
            onChange={(e) => update("clientName", e.target.value)}
            className="w-full px-4 py-3 rounded-lg transition-colors duration-150"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
          />
        </div>
        <div>
          <label htmlFor="t-role" className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
            Role
          </label>
          <input
            id="t-role"
            value={form.role}
            onChange={(e) => update("role", e.target.value)}
            placeholder="e.g. CTO"
            className="w-full px-4 py-3 rounded-lg transition-colors duration-150"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
          />
        </div>
      </div>

      <div>
        <label htmlFor="t-company" className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
          Company
        </label>
        <input
          id="t-company"
          value={form.company}
          onChange={(e) => update("company", e.target.value)}
          placeholder="e.g. Acme Inc."
          className="w-full px-4 py-3 rounded-lg transition-colors duration-150"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full px-8 py-3.5 rounded-lg font-semibold text-white transition-all duration-250 disabled:opacity-60"
        style={{ background: "linear-gradient(135deg, #7C6CFF, #2DD4BF)" }}
      >
        {status === "loading" ? "Submitting..." : "Submit Testimonial"}
      </button>

      {status === "success" && (
        <p className="text-sm text-center" style={{ color: "var(--color-success)" }}>
          Thank you! Your testimonial has been submitted for review.
        </p>
      )}
      {status === "error" && (
        <p className="text-sm text-center" style={{ color: "var(--color-error)" }}>
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}
