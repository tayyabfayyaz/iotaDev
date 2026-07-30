import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ background: "var(--bg-surface)", borderTop: "1px solid var(--border)" }} className="pt-16 pb-6">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <Link href="/" className="inline-block mb-4">
              <img src="/logo.svg" alt="iotaDev" className="h-10 w-auto" />
            </Link>
            <p style={{ color: "var(--text-secondary)" }} className="text-sm leading-relaxed">
              We build the future, for your business. A software house dedicated to delivering exceptional digital products.
            </p>
            <div className="flex gap-4 mt-6">
              {[
                { name: "GitHub", url: "https://github.com/tayyabfayyaz/" },
                { name: "LinkedIn", url: "https://www.linkedin.com/in/tayyab-fayyaz-25757b277/" },
                { name: "X", url: "https://x.com/TayyabFayyaz21" },
              ].map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="flex items-center justify-center w-10 h-10 rounded-lg text-xs font-bold transition-all duration-150 hover:-translate-y-0.5"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {s.name === "X" ? "X" : s.name.slice(0, 2)}
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
                  <Link href={l.href} className="text-sm transition-colors duration-150" style={{ color: "var(--text-secondary)" }}>
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
                  <Link href={l.href} className="text-sm transition-colors duration-150" style={{ color: "var(--text-secondary)" }}>
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
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm transition-colors duration-150" style={{ color: "var(--text-secondary)" }}>
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
