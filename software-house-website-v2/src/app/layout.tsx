import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ThemeProvider from "@/components/ThemeProvider";
import Preloader from "@/components/Preloader";
import ChatWidget from "@/components/ChatWidget";

export const metadata: Metadata = {
  title: {
    default: "iotaDev \u2014 Software House | Web Development, AI/ML & Cloud Consulting",
    template: "%s \u2014 iotaDev",
  },
  description:
    "We build the future, for your business. Expert web development, AI/ML, and cloud consulting services.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "iotaDev \u2014 Software House",
    description:
      "Build the Future, For your Business. Expert web development, AI/ML, and cloud consulting services.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var t = localStorage.getItem('iotadev-theme');
                if (!t) { t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
                document.documentElement.classList.add(t);
              } catch(e) {}
            })();
          `
        }} />
      </head>
      <body className="min-h-screen" style={{ background: "var(--bg)" }}>
        <Preloader />
        <ThemeProvider>
          <Nav />
          <main>{children}</main>
          <Footer />
          <ChatWidget />
        </ThemeProvider>
      </body>
    </html>
  );
}
