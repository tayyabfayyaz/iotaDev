"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "./ThemeProvider";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/team", label: "Team" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/blog", label: "Blog" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className="fixed top-0 inset-x-0 z-50 px-4 pt-4">
      <div className={`nav-shell ${scrolled ? "scrolled" : ""} max-w-6xl mx-auto flex items-center justify-between h-16 pl-4 pr-3 md:px-5 rounded-2xl`}>
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <img src="/logo.svg" alt="iotaDev" className="h-9 w-auto" />
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-3.5 py-2 text-sm font-medium rounded-lg transition-colors duration-150"
                style={{
                  color: active ? "var(--text-primary)" : "var(--text-secondary)",
                  background: active ? "var(--bg-surface)" : "transparent",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={toggle}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-150"
            style={{ background: "var(--bg-surface)", color: "var(--text-primary)" }}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? "\u{2600}\u{FE0F}" : "\u{1F319}"}
          </button>

          <Link
            href="/contact"
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-250 hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(120deg, #7C6CFF, #2DD4BF)",
              boxShadow: "0 8px 20px -8px rgba(124, 108, 255, 0.5)",
            }}
          >
            Contact Us
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggle}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-150"
            style={{ background: "var(--bg-surface)", color: "var(--text-primary)" }}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? "\u{2600}\u{FE0F}" : "\u{1F319}"}
          </button>

          <button
            className="flex flex-col gap-[5px] p-2 cursor-pointer"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <span className="block w-6 h-[2px] transition-all duration-250" style={{ background: "var(--text-primary)", transform: open ? "rotate(45deg) translateY(7px)" : "none" }} />
            <span className="block w-6 h-[2px] transition-all duration-250" style={{ background: "var(--text-primary)", opacity: open ? 0 : 1 }} />
            <span className="block w-6 h-[2px] transition-all duration-250" style={{ background: "var(--text-primary)", transform: open ? "rotate(-45deg) translateY(-7px)" : "none" }} />
          </button>
        </div>
      </div>

      {open && (
        <div
          className="md:hidden mt-2 max-w-6xl mx-auto px-6 py-6 flex flex-col gap-2 rounded-2xl"
          style={{ background: "var(--bg-nav)", backdropFilter: "var(--nav-blur)", border: "1px solid var(--border)" }}
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-sm font-medium px-3 py-2.5 rounded-lg"
              style={{
                color: pathname === link.href ? "var(--text-primary)" : "var(--text-secondary)",
                background: pathname === link.href ? "var(--bg-surface)" : "transparent",
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white text-center mt-1"
            style={{ background: "linear-gradient(120deg, #7C6CFF, #2DD4BF)" }}
          >
            Contact Us
          </Link>
        </div>
      )}
    </nav>
  );
}
