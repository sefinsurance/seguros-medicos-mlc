import React from "react";
import { Eye, CheckCircle, ArrowLeft, MessageCircle } from "lucide-react";

// Chrome-free content body for the Dental & Vision service page (static Astro island).
export default function DentalVisionContent({ lang = "en" }) {

  const content = {
    en: {
      back: "Back to Home",
      badge: "Dental & Vision",
      title: "Dental & Vision Coverage — Active in as Little as 72 Hours",
      sub: "Don't wait months to use your benefits. Our dental and vision plans activate fast — often within 72 hours — with NO waiting periods on most services. Get covered today, use it tomorrow.",
      fastTitle: "⚡ Why People Love Our Dental & Vision Plans",
      fastPoints: [
        "Coverage active in as little as 72 hours after enrollment",
        "No waiting periods on most preventive and basic services",
        "Use your benefits immediately — no 6-month or 1-year delays",
        "Affordable monthly premiums for individuals and entire families",
      ],
      whyTitle: "What's Covered",
      benefits: [
        "🦷 Routine cleanings & X-rays — often at $0 cost to you",
        "🦷 Fillings, extractions, crowns, and root canals",
        "🦷 Orthodontics and braces for adults and children",
        "👓 Annual comprehensive eye exams",
        "👓 Prescription eyeglasses — frames & lenses covered",
        "👓 Contact lens allowance included in many plans",
        "💊 Standalone plans or bundled with your ACA health coverage",
        "👨‍👩‍👧 Cover your entire family under one affordable plan",
      ],
      whoTitle: "Who Needs This?",
      who: "If you don't have dental or vision through an employer, this is for you. Standard ACA health plans do NOT cover adult dental or vision care. Without coverage, a single crown can cost $1,000–$1,800. A pair of prescription glasses can run $300–$600. For less than a few dollars a day, you and your family can be fully covered — starting this week.",
      ctaTitle: "Get Covered in 72 Hours",
      ctaSub: "Our agents will find your best plan and get you enrolled fast — at no cost to you.",
      cta: "Get Covered Now",
      whatsapp: "Chat on WhatsApp",
    },
    es: {
      back: "Volver al inicio",
      badge: "Dental y Visión",
      title: "Cobertura Dental y de Visión — Activa en tan Solo 72 Horas",
      sub: "No esperes meses para usar tus beneficios. Nuestros planes dental y de visión se activan rápido — frecuentemente en 72 horas — SIN períodos de espera en la mayoría de los servicios. Inscríbete hoy, úsalo mañana.",
      fastTitle: "⚡ Por Qué a la Gente le Encantan Nuestros Planes Dental y de Visión",
      fastPoints: [
        "Cobertura activa en tan solo 72 horas después de la inscripción",
        "Sin períodos de espera en la mayoría de los servicios preventivos y básicos",
        "Usa tus beneficios de inmediato — sin esperas de 6 meses o 1 año",
        "Primas mensuales accesibles para individuos y familias completas",
      ],
      whyTitle: "Qué Está Cubierto",
      benefits: [
        "🦷 Limpiezas de rutina y radiografías — frecuentemente a $0",
        "🦷 Empastes, extracciones, coronas y endodoncias",
        "🦷 Ortodoncia y aparatos dentales para adultos y niños",
        "👓 Exámenes completos anuales de la vista",
        "👓 Lentes con receta — armazones y cristales cubiertos",
        "👓 Beneficio para lentes de contacto incluido en muchos planes",
        "💊 Planes individuales o combinados con tu cobertura ACA",
        "👨‍👩‍👧 Cubre a toda tu familia bajo un plan accesible",
      ],
      whoTitle: "¿Quién Necesita Esto?",
      who: "Si no tienes dental o visión a través de un empleador, esto es para ti. Los planes ACA estándar NO cubren dental ni visión para adultos. Sin cobertura, una corona puede costar $1,000–$1,800. Unos lentes con receta pueden costar $300–$600. Por menos de unos pocos dólares al día, tú y tu familia pueden estar completamente cubiertos — a partir de esta semana.",
      ctaTitle: "Obtén Cobertura en 72 Horas",
      ctaSub: "Nuestros agentes encontrarán tu mejor plan y te inscribirán rápido — sin costo para ti.",
      cta: "Obtener Cobertura Ahora",
      whatsapp: "Hablar por WhatsApp",
    }
  };

  const c = content[lang];

  return (
    <>
        <a href="/" className="inline-flex items-center gap-2 text-sm text-[#1e3a5f] font-semibold mb-8 hover:underline">
          <ArrowLeft className="w-4 h-4" /> {c.back}
        </a>

        {/* Banner with title overlay */}
         <div className="relative rounded-2xl overflow-hidden shadow-xl mb-8">
           <img
             src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69ab1578c293524eeeb25c69/a714e181b_dental.png"
             alt="Dental family"
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

        {/* Fast activation highlight */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-bold text-green-800 mb-4">{c.fastTitle}</h2>
          <ul className="space-y-3">
            {c.fastPoints.map((p, i) => (
              <li key={i} className="flex items-start gap-3 text-green-900 font-medium">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                {p}
              </li>
            ))}
          </ul>
        </div>

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

        <div className="bg-sky-50 rounded-2xl p-8 mb-10 border border-sky-100">
          <h2 className="text-xl font-bold text-[#1e3a5f] mb-3">{c.whoTitle}</h2>
          <p className="text-gray-600">{c.who}</p>
        </div>

        <div className="bg-[#1e3a5f] rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">{c.ctaTitle}</h2>
          <p className="text-blue-200 mb-6">{c.ctaSub}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              data-open-quote
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

    </>
  );
}