import React, { useState } from "react";
import { Shield, CheckCircle, ArrowLeft, MessageCircle, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import QuoteModal from "@/components/quote/QuoteModal";
import ContactBar from "@/components/home/ContactBar";
import Footer from "@/components/home/Footer";
import UsStateMap from "@/components/home/UsStateMap";

export default function Obamacare() {
  const [lang, setLang] = useState("en");
  const [quoteOpen, setQuoteOpen] = useState(false);

  const content = {
    en: {
      back: "Back to Home",
      badge: "ACA / Obamacare",
      title: "You May Qualify for Health Insurance Starting at $0/Month",
      sub: "Millions of Americans are leaving free or low-cost health coverage on the table. With ACA Marketplace plans and enhanced subsidies, your family may be covered for as little as $0 per month — right now.",
      whyTitle: "What You Get With an ACA Plan",
      benefits: [
        "🟢 $0/month premiums available for many households — you may already qualify",
        "🟢 No denials for pre-existing conditions — diabetes, asthma, heart disease covered",
        "🟢 Doctor visits, ER care, prescriptions, lab work & mental health — all included",
        "🟢 Maternity & newborn care, preventive screenings at no extra cost",
        "🟢 Dental & vision add-ons available for the whole family",
        "🟢 Special Enrollment available if you lost a job, got married, had a baby, or moved",
        "🟢 Subsidies based on income — most families pay far less than they expect",
        "🟢 Our agents compare every plan for FREE — no obligation, no pressure",
      ],
      whoTitle: "Who Qualifies? (More People Than You Think)",
      who: "If you're a U.S. citizen or legal resident without employer coverage, you likely qualify. Even if you tried before and didn't qualify, enhanced subsidies may now make you eligible. A family of 4 earning up to $125,000/year can qualify for substantial subsidies. Don't guess — let one of our licensed agents check in minutes.",
      urgencyTitle: "Don't Wait — Coverage Gaps Are Costly",
      urgency: "One unexpected ER visit without insurance can cost $5,000–$30,000+. A single hospitalization can wipe out years of savings. The good news: ACA coverage can start as soon as the 1st of next month. Our agents will do all the paperwork — at no cost to you.",
      ctaTitle: "Get Your Free Quote in Minutes",
      ctaSub: "No obligation. No pressure. Just answers. Let us find your best plan today.",
      cta: "Check My Eligibility Now",
      whatsapp: "Chat on WhatsApp",
    },
    es: {
      back: "Volver al inicio",
      badge: "ACA / Obamacare",
      title: "Podrías Calificar para Seguro de Salud desde $0 al Mes",
      sub: "Millones de familias no están aprovechando la cobertura gratuita o de bajo costo disponible. Con los planes ACA y los subsidios mejorados, tu familia podría estar cubierta desde $0 al mes — ahora mismo.",
      whyTitle: "Qué Incluye un Plan ACA",
      benefits: [
        "🟢 Primas desde $0/mes disponibles para muchas familias — podrías calificar ya",
        "🟢 Sin rechazos por condiciones preexistentes — diabetes, asma, enfermedades cardíacas cubiertas",
        "🟢 Médico, urgencias, medicamentos, laboratorio y salud mental — todo incluido",
        "🟢 Maternidad, atención al recién nacido y chequeos preventivos sin costo adicional",
        "🟢 Cobertura dental y de visión disponible para toda la familia",
        "🟢 Inscripción especial si perdiste trabajo, te casaste, tuviste un bebé o te mudaste",
        "🟢 Subsidios basados en ingresos — la mayoría paga mucho menos de lo que espera",
        "🟢 Nuestros agentes comparan todos los planes GRATIS — sin compromiso ni presión",
      ],
      whoTitle: "¿Quién Califica? (Más Personas de las que Crees)",
      who: "Si eres ciudadano estadounidense o residente legal sin cobertura del empleador, probablemente calificas. Aunque lo hayas intentado antes y no hayas calificado, los nuevos subsidios pueden hacerte elegible ahora. Una familia de 4 que gana hasta $125,000/año puede calificar para subsidios importantes. No adivines — deja que un agente licenciado lo revise en minutos.",
      urgencyTitle: "No Esperes — Las Brechas en Cobertura Son Costosas",
      urgency: "Una visita de emergencia sin seguro puede costar entre $5,000 y $30,000 o más. Una hospitalización puede acabar con años de ahorros. La buena noticia: la cobertura ACA puede comenzar el 1° del próximo mes. Nuestros agentes harán todo el papeleo — sin costo para ti.",
      ctaTitle: "Obtén Tu Cotización Gratis en Minutos",
      ctaSub: "Sin compromiso. Sin presión. Solo respuestas. Déjanos encontrar tu mejor plan hoy.",
      cta: "Verificar Mi Elegibilidad Ahora",
      whatsapp: "Hablar por WhatsApp",
    }
  };

  const c = content[lang];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <ContactBar lang={lang} setLang={setLang} />

      <div className="max-w-4xl mx-auto px-4 py-10">
        <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-sm text-[#1e3a5f] font-semibold mb-8 hover:underline">
          <ArrowLeft className="w-4 h-4" /> {c.back}
        </Link>

        {/* Banner with title overlay */}
         <div className="relative rounded-2xl overflow-hidden shadow-xl mb-8">
           <img
             src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69ab1578c293524eeeb25c69/599996586_life.png"
             alt="Happy family"
             className="w-full object-cover max-h-[500px]"
           />
           <div className="absolute bottom-0 left-0 right-0 h-[15%] bg-gradient-to-b from-transparent to-black/30 pointer-events-none" />
           <div className="absolute bottom-0 left-0 right-0 px-6 py-5 bg-gradient-to-t from-[#1e3a5f]/50 to-transparent">
             <h1 className="text-base md:text-xl lg:text-2xl font-extrabold text-white leading-tight text-center drop-shadow-lg w-full whitespace-nowrap">
               {c.title}
             </h1>
           </div>
         </div>

         <div className="text-center mb-12">
           <p className="text-gray-600 text-lg max-w-2xl mx-auto">{c.sub}</p>
         </div>

        {/* Benefits */}
        <div className="bg-white rounded-2xl shadow p-8 mb-8">
          <h2 className="text-xl font-bold text-[#1e3a5f] mb-5">{c.whyTitle}</h2>
          <ul className="space-y-3">
            {c.benefits.map((b, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="bg-[#1e3a5f] rounded-2xl p-8 text-white text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">{c.ctaTitle}</h2>
          <p className="text-blue-200 mb-6">{c.ctaSub}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setQuoteOpen(true)}
              className="bg-white text-[#1e3a5f] font-bold rounded-full px-8 py-4 hover:bg-blue-50 transition-colors"
            >
              {c.cta}
            </button>
            <a
              href="https://wa.me/18774582557"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#22c55e] text-white font-bold rounded-full px-8 py-4 hover:bg-[#16a34a] transition-colors"
            >
              <MessageCircle className="w-5 h-5" /> {c.whatsapp}
            </a>
          </div>
        </div>

        {/* Who qualifies */}
        <div className="bg-blue-50 rounded-2xl p-8 mb-8 border border-blue-100">
          <h2 className="text-xl font-bold text-[#1e3a5f] mb-3">{c.whoTitle}</h2>
          <p className="text-gray-600">{c.who}</p>
        </div>

        {/* Urgency */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 mb-10">
          <h2 className="text-xl font-bold text-amber-800 mb-3">⚠️ {c.urgencyTitle}</h2>
          <p className="text-amber-900">{c.urgency}</p>
        </div>

        {/* Mission / Family Section */}
        <div className="mt-10 bg-white rounded-2xl shadow-md p-8 border border-blue-100">
          <div className="text-center mb-6">
            <span className="text-4xl">🤝</span>
            <h2 className="text-2xl font-extrabold text-[#1e3a5f] mt-3 mb-2">
              {lang === "es"
                ? "Nuestro Compromiso: Tratarte Como Familia"
                : "Our Mission: Treating Every Client Like Family"}
            </h2>
            <p className="text-gray-500 text-sm">
              {lang === "es"
                ? "Reconocidos a nivel nacional por nuestro servicio al cliente excepcional"
                : "Recognized nationwide for our exceptional customer service"}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-blue-50 rounded-xl p-6">
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="font-bold text-[#1e3a5f] mb-2">
                {lang === "es" ? "Seleccionamos el Mejor Plan" : "We Handpick Your Best Plan"}
              </h3>
              <p className="text-gray-600 text-sm">
                {lang === "es"
                  ? "Comparamos cada opción disponible para encontrar el plan que mejor se adapta a tu familia, tu salud y tu presupuesto."
                  : "We compare every available option to find the plan that fits your family, your health needs, and your budget."}
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-6">
              <div className="text-3xl mb-3">💬</div>
              <h3 className="font-bold text-[#1e3a5f] mb-2">
                {lang === "es" ? "Explicamos Cada Detalle" : "We Explain Every Detail"}
              </h3>
              <p className="text-gray-600 text-sm">
                {lang === "es"
                  ? "Sin letra pequeña ni confusión. Te guiamos paso a paso para que entiendas exactamente cómo tu cobertura te beneficia."
                  : "No fine print confusion. We walk you through every detail so you understand exactly how your coverage benefits you."}
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-6">
              <div className="text-3xl mb-3">⭐</div>
              <h3 className="font-bold text-[#1e3a5f] mb-2">
                {lang === "es" ? "Siempre Damos la Milla Extra" : "We Always Go the Extra Mile"}
              </h3>
              <p className="text-gray-600 text-sm">
                {lang === "es"
                  ? "Nuestros clientes no son solo números. Hacemos que cada interacción se sienta como si ya fueras parte de nuestra familia."
                  : "Our clients are never just a number. We make every interaction feel like you're already part of our family."}
              </p>
            </div>
          </div>
        </div>

        {/* State Coverage Map */}
        <UsStateMap lang={lang} onGetQuote={() => setQuoteOpen(true)} />

        <div className="text-center mt-8">
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="text-[#1e3a5f] text-sm font-semibold hover:underline">
            ↑ {lang === "es" ? "Volver arriba" : "Back to top"}
          </button>
        </div>
      </div>

      <Footer lang={lang} />
      <QuoteModal open={quoteOpen} onClose={() => setQuoteOpen(false)} ctaSource="instant_quote" lang={lang} />
    </div>
  );
}