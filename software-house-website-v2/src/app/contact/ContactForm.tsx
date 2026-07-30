"use client";

import { useState } from "react";

const services = [
  { value: "", label: "Select a service..." },
  { value: "web-dev", label: "Web Development" },
  { value: "ai-ml", label: "AI & Machine Learning" },
  { value: "cloud", label: "Cloud Consulting" },
  { value: "other", label: "Other" },
];

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  function validate(form: HTMLFormElement) {
    const data = new FormData(form);
    const errs: Record<string, boolean> = {};
    if (!data.get("name")) errs.name = true;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((data.get("email") as string) || "")) errs.email = true;
    if (!data.get("message")) errs.message = true;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!validate(form)) return;

    setLoading(true);
    const data = new FormData(form);
    const payload = Object.fromEntries(data);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSubmitted(true);
        form.reset();
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        alert("Failed to send message. Please try again.");
      }
    } catch {
      alert("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className="block text-sm font-semibold mb-1">Full Name *</label>
        <input id="name" name="name" type="text" required
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-secondary transition-colors duration-150" />
        {errors.name && <p className="text-red-600 text-sm mt-1">Please enter your name.</p>}
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-semibold mb-1">Email Address *</label>
        <input id="email" name="email" type="email" required
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-secondary transition-colors duration-150" />
        {errors.email && <p className="text-red-600 text-sm mt-1">Please enter a valid email address.</p>}
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-semibold mb-1">Phone Number</label>
        <input id="phone" name="phone" type="tel"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-secondary transition-colors duration-150" />
      </div>
      <div>
        <label htmlFor="service" className="block text-sm font-semibold mb-1">Service Interest</label>
        <select id="service" name="service"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-secondary transition-colors duration-150">
          {services.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-semibold mb-1">Message *</label>
        <textarea id="message" name="message" required rows={5}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-secondary transition-colors duration-150 resize-y min-h-[140px]" />
        {errors.message && <p className="text-red-600 text-sm mt-1">Please enter your message.</p>}
      </div>
      <button type="submit" disabled={loading}
        className="px-7 py-3 bg-secondary text-white font-semibold rounded-lg hover:bg-secondary-dark transition-colors duration-150 disabled:opacity-60">
        {loading ? "Sending..." : "Send Message"}
      </button>
      {submitted && (
        <div className="p-4 bg-secondary/10 border border-secondary rounded-lg text-secondary font-semibold text-center">
          Thank you! Your message has been sent. We'll get back to you within 24 hours.
        </div>
      )}
    </form>
  );
}
