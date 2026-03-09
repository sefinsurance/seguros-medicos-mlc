import React, { useState } from "react";
import HeroSection from "@/components/home/HeroSection";
import ProductCards from "@/components/home/ProductCards";
import QuoteModal from "@/components/quote/QuoteModal";
import ContactBar from "@/components/home/ContactBar";
import FAQSection from "@/components/home/FAQSection";
import Testimonials from "@/components/home/Testimonials";
import AgentBios from "@/components/home/AgentBios";
import Footer from "@/components/home/Footer";

export default function Home() {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [ctaSource, setCtaSource] = useState("instant_quote");
  const [lang, setLang] = useState("en");

  const openQuote = (source = "instant_quote") => {
    setCtaSource(source);
    setQuoteOpen(true);
  };

  return (
    <div className="min-h-screen" style={{background: "linear-gradient(160deg, #ebf5ff 0%, #dae8f6 50%, #d4e3f4 100%)"}}>
      <ContactBar lang={lang} setLang={setLang} />
      <HeroSection lang={lang} onInstantQuote={() => openQuote("instant_quote")} onContactAgent={() => openQuote("contact_live_agent")} />
      <ProductCards lang={lang} />
      <FAQSection lang={lang} />
      <Testimonials lang={lang} />
      <AgentBios lang={lang} />
      <Footer lang={lang} />
      <QuoteModal open={quoteOpen} onClose={() => setQuoteOpen(false)} ctaSource={ctaSource} lang={lang} />
    </div>
  );
}