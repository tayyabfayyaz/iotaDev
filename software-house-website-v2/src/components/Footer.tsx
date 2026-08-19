import Link from "next/link";

const socials = [
  {
    name: "GitHub",
    url: "https://github.com/tayyabfayyaz/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.73.81 1.18 1.84 1.18 3.1 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14 0 1.54-.01 2.79-.01 3.17 0 .31.21.68.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/tayyab-fayyaz-25757b277/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    name: "X",
    url: "https://x.com/TayyabFayyaz21",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="relative" style={{ background: "var(--bg-surface)" }}>
      <div
        className="h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(124,108,255,0.6), rgba(45,212,191,0.6), transparent)" }}
      />
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-14">
          <div>
            <Link href="/" className="inline-block mb-4">
              <img src="/logo.svg" alt="iotaDev" className="h-10 w-auto" />
            </Link>
            <p style={{ color: "var(--text-secondary)" }} className="text-sm leading-relaxed">
              We build the future, for your business. A software house dedicated to delivering exceptional digital products.
            </p>
            <div className="flex gap-3 mt-6">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-6 tracking-wider uppercase" style={{ color: "var(--text-muted)" }}>
              Services
            </h4>
            <ul className="space-y-3">
              {[
                { href: "/services#web-dev", label: "Web Development" },
                { href: "/services#ai-ml", label: "AI & Machine Learning" },
                { href: "/services#cloud", label: "Cloud Consulting" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm transition-colors duration-150 hover:text-primary" style={{ color: "var(--text-secondary)" }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-6 tracking-wider uppercase" style={{ color: "var(--text-muted)" }}>
              Company
            </h4>
            <ul className="space-y-3">
              {[
                { href: "/about", label: "About Us" },
                { href: "/team", label: "Our Team" },
                { href: "/portfolio", label: "Portfolio" },
                { href: "/blog", label: "Blog" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm transition-colors duration-150 hover:text-primary" style={{ color: "var(--text-secondary)" }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-6 tracking-wider uppercase" style={{ color: "var(--text-muted)" }}>
              Contact
            </h4>
            <ul className="space-y-3">
              {[
                { href: "/contact", label: "Get in Touch" },
                { href: "/faq", label: "FAQ" },
                { href: "/ask", label: "Ask iota (AI)" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm transition-colors duration-150 hover:text-primary" style={{ color: "var(--text-secondary)" }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-6 text-center text-sm" style={{ borderTop: "1px solid var(--border)", color: "var(--text-muted)" }}>
          <p>&copy; {new Date().getFullYear()} iotaDev. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
