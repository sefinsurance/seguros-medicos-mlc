import React, { useState } from "react";
import HeroSection from "@/components/home/HeroSection";
import QuoteModal from "@/components/quote/QuoteModal";

// Small island that pairs the hero CTAs with the quote modal, lifted out of the
// old full-page React Home so only this interactive piece hydrates (the rest of
// the homepage is static Astro). Behavior is identical to before.
export default function HeroQuote({ lang = "en" }) {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [ctaSource, setCtaSource] = useState("instant_quote");

  const openQuote = (source = "instant_quote") => {
    setCtaSource(source);
    setQuoteOpen(true);
  };

  return (
    <>
      <HeroSection
        lang={lang}
        onInstantQuote={() => openQuote("instant_quote")}
        onContactAgent={() => openQuote("contact_live_agent")}
      />
      <QuoteModal open={quoteOpen} onClose={() => setQuoteOpen(false)} ctaSource={ctaSource} lang={lang} />
    </>
  );
}
