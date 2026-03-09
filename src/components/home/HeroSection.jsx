import React from "react";
import { MessageCircle } from "lucide-react";

const copy = {
  en: {
    headline: "You May Qualify for Health Insurance Starting at $0/Month",
    sub: "Millions of Americans are leaving free or low-cost health coverage on the table. With ACA Marketplace plans and enhanced subsidies, your family may be covered for as little as $0 per month — right now.",
    whatsapp: "Chat on WhatsApp",
    compare: "Contact Me",
  },
  es: {
    headline: "Podría Calificar para un Seguro de Salud desde $0/mes",
    sub: "Millones de estadounidenses no están aprovechando la cobertura de salud gratuita o de bajo costo. Con los planes ACA Marketplace y los subsidios mejorados, tu familia podría estar cubierta desde $0 al mes — ahora mismo.",
    whatsapp: "Hablar por WhatsApp",
    compare: "Contáctame",
  }
};

export default function HeroSection({ lang, onInstantQuote, onContactAgent }) {
  const c = copy[lang] || copy.en;
  return (
    <section className="px-4 pt-6 pb-10">
      <div className="max-w-5xl mx-auto">
        {/* Banner with overlay */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl mb-6">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69ab1578c293524eeeb25c69/3d1246348_banner.png"
            alt="Happy family"
            className="w-full object-cover max-h-[420px]"
          />
          {/* Text overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 px-6 py-5 bg-gradient-to-t from-[#1e3a5f]/50 to-transparent">
            <h1 className="text-base md:text-xl lg:text-2xl font-extrabold text-white leading-tight text-center drop-shadow-lg w-full whitespace-nowrap">
              {c.headline}
            </h1>
          </div>
        </div>

        {/* Description + CTAs below banner */}
        <p className="text-gray-700 text-lg mb-8 max-w-3xl mx-auto text-center">
          {c.sub}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap">
          <a
            href="https://wa.me/18774582557"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#22c55e] text-white font-bold rounded-full px-8 py-4 text-lg hover:bg-[#16a34a] transition-colors shadow-lg"
          >
            <MessageCircle className="w-5 h-5" />
            {c.whatsapp}
          </a>
          <button
            onClick={onInstantQuote}
            className="bg-[#1e3a5f] text-white font-bold rounded-full px-8 py-4 text-lg hover:bg-[#162d4a] transition-colors shadow-lg"
          >
            {c.compare}
          </button>
        </div>
      </div>
    </section>
  );
}