import React, { useState, useEffect } from "react";
import QuoteModal from "@/components/quote/QuoteModal";

// Small island that owns the quote modal. Any static button on the page can open
// it by dispatching a `mlc:open-quote` CustomEvent (optionally with detail.source).
// This decouples the (static, zero-JS) CTA buttons from the modal so the rest of
// the page doesn't need to hydrate.
export default function QuoteModalLauncher({ lang = "en" }) {
  const [open, setOpen] = useState(false);
  const [ctaSource, setCtaSource] = useState("instant_quote");

  useEffect(() => {
    const handler = (e) => {
      setCtaSource((e && e.detail && e.detail.source) || "instant_quote");
      setOpen(true);
    };
    window.addEventListener("mlc:open-quote", handler);
    return () => window.removeEventListener("mlc:open-quote", handler);
  }, []);

  return <QuoteModal open={open} onClose={() => setOpen(false)} ctaSource={ctaSource} lang={lang} />;
}
