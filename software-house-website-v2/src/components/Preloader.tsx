"use client";

import { useEffect, useState } from "react";

type Phase = "loading" | "fading" | "done";

export default function Preloader() {
  const [phase, setPhase] = useState<Phase>("loading");

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const minDelay = reduceMotion ? 0 : 1400;
    const fadeDuration = reduceMotion ? 0 : 550;

    const minTimer = setTimeout(() => {
      setPhase("fading");
      setTimeout(() => setPhase("done"), fadeDuration);
    }, minDelay);

    return () => clearTimeout(minTimer);
  }, []);

  useEffect(() => {
    if (phase === "loading") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center preloader ${
        phase === "fading" ? "preloader-hidden" : ""
      }`}
      style={{ background: "var(--bg)" }}
      aria-hidden={phase !== "loading"}
    >
      <div className="flex flex-col items-center gap-8 px-6">
        <img src="/logo.svg" alt="iotaDev" className="h-16 w-auto preloader-logo" />
        <div className="preloader-track w-56">
          <div className="preloader-bar" />
        </div>
        <p className="text-xs tracking-[0.3em] uppercase" style={{ color: "var(--text-muted)" }}>
          Loading&hellip;
        </p>
      </div>
    </div>
  );
}
