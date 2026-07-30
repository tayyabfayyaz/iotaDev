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
  { href: "/blog", label: "Blog" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-250"
      style={{
        background: scrolled ? "var(--bg-nav)" : "transparent",
        backdropFilter: scrolled ? "var(--nav-blur)" : "none",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-[70px]">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="iotaDev" className="h-10 w-auto" />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium transition-colors duration-150 relative after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-[2px] after:bg-gradient-to-r after:from-primary after:to-secondary after:scale-x-0 after:transition-transform after:duration-250"
              style={{
                color: pathname === link.href ? "var(--text-primary)" : "var(--text-secondary)",
              }}
            >
              {link.label}
            </Link>
          ))}

          <button
            onClick={toggle}
            className="p-2 rounded-lg transition-colors duration-150"
            style={{ background: "var(--bg-surface)", color: "var(--text-primary)" }}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? "\u{2600}\u{FE0F}" : "\u{1F319}"}
          </button>

          <Link
            href="/contact"
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-250 hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
            }}
          >
            Contact Us
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggle}
            className="p-2 rounded-lg transition-colors duration-150"
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
          className="md:hidden px-6 py-6 flex flex-col gap-4 shadow-lg"
          style={{ background: "var(--bg-nav)", backdropFilter: "var(--nav-blur)", borderBottom: "1px solid var(--border)" }}
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-sm font-medium"
              style={{ color: pathname === link.href ? "var(--text-primary)" : "var(--text-secondary)" }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white text-center"
            style={{ background: "linear-gradient(135deg, #8B5CF6, #06B6D4)" }}
          >
            Contact Us
          </Link>
        </div>
      )}
    </nav>
  );
}
