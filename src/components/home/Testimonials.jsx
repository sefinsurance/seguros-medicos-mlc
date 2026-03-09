import React, { useState, useRef } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = {
  en: [
    { name: "Maria G.", location: "Miami, FL", text: "I had no idea I qualified for a $0/month plan. The agent walked me through everything in Spanish and got me covered in one day. Incredible service!", stars: 5 },
    { name: "Carlos R.", location: "Orlando, FL", text: "I was so confused about Medicare options. They explained everything clearly and found me a plan that includes my doctor and my medications. Highly recommend.", stars: 5 },
    { name: "Lisette M.", location: "Houston, TX", text: "Fast, professional, and bilingual. They answered all my questions via WhatsApp and I had my insurance card within a week. 10/10.", stars: 5 },
    { name: "José A.", location: "Tampa, FL", text: "MLC Insurance helped my whole family get covered during open enrollment. No pressure, honest advice, and amazing follow-up. Truly family-oriented.", stars: 5 },
    { name: "Diana P.", location: "Dallas, TX", text: "I switched from my old plan and saved over $200/month thanks to their help. The process was simple and they handled everything for me.", stars: 5 },
    { name: "Roberto F.", location: "Chicago, IL", text: "As a small business owner, I needed life insurance fast. They found me a great term policy at an affordable rate and explained every detail. Very trustworthy.", stars: 5 },
  ],
  es: [
    { name: "Maria G.", location: "Miami, FL", text: "No sabía que calificaba para un plan de $0 al mes. El agente me explicó todo en español y me dio cobertura en un día. ¡Servicio increíble!", stars: 5 },
    { name: "Carlos R.", location: "Orlando, FL", text: "Estaba muy confundido con las opciones de Medicare. Me explicaron todo claramente y encontraron un plan que incluye a mi médico y mis medicamentos.", stars: 5 },
    { name: "Lisette M.", location: "Houston, TX", text: "Rápido, profesional y bilingüe. Respondieron todas mis preguntas por WhatsApp y tuve mi tarjeta de seguro en una semana. 10/10.", stars: 5 },
    { name: "José A.", location: "Tampa, FL", text: "MLC Insurance ayudó a toda mi familia durante la inscripción abierta. Sin presión, consejos honestos y un seguimiento excelente. Verdaderamente orientados a la familia.", stars: 5 },
    { name: "Diana P.", location: "Dallas, TX", text: "Cambié mi plan anterior y ahorré más de $200 al mes gracias a su ayuda. El proceso fue sencillo y ellos se encargaron de todo.", stars: 5 },
    { name: "Roberto F.", location: "Chicago, IL", text: "Como dueño de negocio, necesitaba seguro de vida rápido. Encontraron una excelente póliza a término a precio accesible y explicaron cada detalle. Muy confiables.", stars: 5 },
  ],
};

function StarRow({ count }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      ))}
    </div>
  );
}

export default function Testimonials({ lang }) {
  const items = testimonials[lang] || testimonials.en;
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(null);

  const total = items.length;

  const prev = () => setCurrent(c => (c - 1 + total) % total);
  const next = () => setCurrent(c => (c + 1) % total);

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    touchStartX.current = null;
  };

  // Show 2 cards: current and current+1
  const getCard = (offset) => items[(current + offset) % total];

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-extrabold text-[#1e3a5f] text-center mb-2">
          {lang === "es" ? "Lo Que Dicen Nuestros Clientes" : "What Our Clients Say"}
        </h2>
        <p className="text-slate-500 mb-10 text-sm text-center">
          {lang === "es" ? "Familias reales. Resultados reales." : "Real families. Real results."}
        </p>

        <div className="relative flex items-center gap-3">
          {/* Left Arrow */}
          <button
            onClick={prev}
            className="shrink-0 w-10 h-10 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center text-[#1e3a5f] hover:bg-blue-50 transition-colors z-10"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Cards */}
          <div
            className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5 overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {[0, 1].map((offset) => {
              const t = getCard(offset);
              return (
                <div
                  key={(current + offset) % total}
                  className="bg-white rounded-2xl shadow p-6 flex flex-col gap-3 border border-gray-100 hover:shadow-md transition-all duration-300"
                >
                  <StarRow count={t.stars} />
                  <p className="text-gray-700 text-sm leading-relaxed flex-1">"{t.text}"</p>
                  <div className="pt-2 border-t border-gray-100">
                    <div className="font-bold text-[#1e3a5f] text-sm">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.location}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Arrow */}
          <button
            onClick={next}
            className="shrink-0 w-10 h-10 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center text-[#1e3a5f] hover:bg-blue-50 transition-colors z-10"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-[#1e3a5f]" : "bg-gray-300"}`}
              aria-label={`Go to ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}