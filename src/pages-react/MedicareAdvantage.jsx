import React, { useState } from "react";
import { Heart, CheckCircle, ArrowLeft, MessageCircle } from "lucide-react";
import MedicareFAQ from "@/components/medicare/MedicareFAQ";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import QuoteModal from "@/components/quote/QuoteModal";
import ContactBar from "@/components/home/ContactBar";
import Footer from "@/components/home/Footer";

export default function MedicareAdvantage() {
  const [lang, setLang] = useState("en");
  const [quoteOpen, setQuoteOpen] = useState(false);

  const content = {
    en: {
      back: "Back to Home",
      badge: "Medicare Advantage",
      title: "Get More From Medicare — At Little or No Extra Cost",
      sub: "Original Medicare leaves significant gaps. Medicare Advantage (Part C) fills those gaps and adds powerful extra benefits — often for $0 additional monthly premium. You deserve the full coverage you've earned.",
      whyTitle: "Benefits Medicare Advantage Adds — That Original Medicare Doesn't Cover",
      benefits: [
      "🦷 Dental coverage — cleanings, fillings, extractions & dentures",
      "👓 Vision coverage — annual eye exams, glasses & contact lenses",
      "👂 Hearing coverage — exams and hearing aids",
      "💊 Prescription drug coverage (Part D) bundled into most plans",
      "🏋️ Fitness & wellness memberships (SilverSneakers) included in many plans",
      "🚗 Transportation to doctor appointments covered by select plans",
      "🏥 Out-of-pocket maximum — Original Medicare has NO spending cap, Advantage does",
      "🩺 Chronic condition management programs for diabetes, heart disease & more",
      "📞 24/7 nurse hotlines and telehealth visits from home",
      "🥗 Meal delivery after hospital stays in some plans"],

      otcTitle: "Save on Everyday Essentials & Part B Premium",
      otcItems: [
      { title: "💊 OTC Benefits", desc: "Many plans include $50–$100+ annually for over-the-counter medications, vitamins & health essentials" },
      { title: "🛒 Grocery & Meal Credits", desc: "Select plans offer $75–$360/month in grocery credits to help offset food & nutrition costs" },
      { title: "💰 Part B Premium Assistance", desc: "Plans that help cover your Medicare Part B premium ($205/month) — keeping more money in your pocket" },
      { title: "🏠 Supplemental Benefits", desc: "Additional coverage for utilities, home safety modifications, personal care & more" }],

      whoTitle: "Who Is Eligible?",
      who: "Anyone enrolled in Medicare Part A and Part B who lives in the plan's service area. Most people qualify at age 65 — or earlier with a qualifying disability. If you're already on Medicare, you can switch to a Medicare Advantage plan during the Annual Enrollment Period (Oct 15 – Dec 7) or a Special Enrollment Period.",
      compareTitle: "Original Medicare vs. Medicare Advantage",
      compareItems: [
      { label: "Dental, Vision & Hearing", orig: "❌ Not covered", adv: "✅ Included" },
      { label: "Prescription Drugs", orig: "❌ Separate plan needed", adv: "✅ Usually bundled" },
      { label: "Out-of-Pocket Cap", orig: "❌ No limit", adv: "✅ Annual maximum" },
      { label: "Fitness Benefits", orig: "❌ Not covered", adv: "✅ Often included" },
      { label: "Monthly Premium", orig: "Part B only (~$205/mo)", adv: "Often $0 added cost" }],

      ctaTitle: "Find Out What Extra Benefits You Qualify For",
      ctaSub: "Our licensed Medicare agents will compare every plan in your area — completely free.",
      cta: "Compare My Plans Now",
      whatsapp: "Chat on WhatsApp"
    },
    es: {
      back: "Volver al inicio",
      badge: "Medicare Advantage",
      title: "Obtén Más de Medicare — Sin Costo Adicional",
      sub: "El Medicare Original deja brechas importantes. Medicare Advantage (Parte C) las cubre y agrega beneficios adicionales poderosos — frecuentemente con $0 de prima mensual adicional. Mereces la cobertura completa que te has ganado.",
      whyTitle: "Beneficios que Medicare Advantage Agrega — Que Medicare Original No Cubre",
      benefits: [
      "🦷 Cobertura dental — limpiezas, empastes, extracciones y dentaduras",
      "👓 Cobertura de visión — exámenes anuales, lentes y anteojos",
      "👂 Cobertura auditiva — exámenes y audífonos",
      "💊 Cobertura de medicamentos (Parte D) incluida en la mayoría de los planes",
      "🏋️ Membresías de bienestar y ejercicio (SilverSneakers) en muchos planes",
      "🚗 Transporte a citas médicas cubierto en planes selectos",
      "🏥 Límite de gastos de bolsillo — Medicare Original no tiene límite, Advantage sí",
      "🩺 Programas de manejo de condiciones crónicas: diabetes, enfermedades cardíacas y más",
      "📞 Líneas de enfermeras 24/7 y visitas de telesalud desde casa",
      "🥗 Entrega de comidas tras hospitalizaciones en algunos planes"],

      otcTitle: "Ahorra en Esenciales Diarios y Prima de Parte B",
      otcItems: [
      { title: "💊 Beneficios OTC", desc: "Muchos planes incluyen $50–$100+ anuales para medicamentos sin receta, vitaminas y productos de salud" },
      { title: "🛒 Créditos de Comestibles", desc: "Planes selectos ofrecen $75–$360/mes en créditos de comestibles para ayudar con alimentos y nutrición" },
      { title: "💰 Asistencia Prima Parte B", desc: "Planes que ayudan a cubrir tu prima de Medicare Parte B ($205/mes) — manteniendo más dinero en tu bolsillo" },
      { title: "🏠 Beneficios Complementarios", desc: "Cobertura adicional para servicios, modificaciones de seguridad del hogar, cuidado personal y más" }],

      whoTitle: "¿Quién Es Elegible?",
      who: "Cualquier persona inscrita en Medicare Partes A y B que viva en el área de servicio del plan. La mayoría califica a los 65 años — o antes con una discapacidad calificada. Si ya tienes Medicare, puedes cambiar durante el Período de Inscripción Anual (15 oct – 7 dic) o un Período de Inscripción Especial.",
      compareTitle: "Medicare Original vs. Medicare Advantage",
      compareItems: [
      { label: "Dental, Visión y Audición", orig: "❌ No cubierto", adv: "✅ Incluido" },
      { label: "Medicamentos", orig: "❌ Plan separado", adv: "✅ Usualmente incluido" },
      { label: "Límite de Gastos", orig: "❌ Sin límite", adv: "✅ Máximo anual" },
      { label: "Beneficios de Bienestar", orig: "❌ No cubierto", adv: "✅ Frecuentemente incluido" },
      { label: "Prima Mensual", orig: "Solo Parte B (~$205/mes)", adv: "Frecuentemente $0 adicional" }],

      ctaTitle: "Descubre Qué Beneficios Extra Calificas",
      ctaSub: "Nuestros agentes de Medicare licenciados compararán cada plan en tu área — completamente gratis.",
      cta: "Comparar Mis Planes Ahora",
      whatsapp: "Hablar por WhatsApp"
    }
  };

  const c = content[lang];

  return (
    <div className="min-h-screen" style={{ background: "#e8f1f8" }}>
      <ContactBar lang={lang} setLang={setLang} />

      <div className="max-w-4xl mx-auto px-4 py-10">
        <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-sm text-[#1e3a5f] font-semibold mb-8 hover:underline">
          <ArrowLeft className="w-4 h-4" /> {c.back}
        </Link>

        {/* Banner with title overlay */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl mb-8">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69ab1578c293524eeeb25c69/3677e907f_Medicare.png"
            alt="Senior couple"
            className="w-full object-cover max-h-[360px]" />

          <div className="bg-gradient-to-r opacity-0 absolute inset-0 from-[#1e3a5f]/70 via-[#1e3a5f]/60 to-transparent">
            <h1 className="text-base md:text-xl lg:text-2xl font-extrabold text-white leading-tight text-center drop-shadow-lg w-full whitespace-nowrap">
              {c.title}
            </h1>
          </div>
        </div>

        <div className="text-center mb-12">
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">{c.sub}</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-8 mb-8">
          <h2 className="text-xl font-bold text-[#1e3a5f] mb-5">{c.whyTitle}</h2>
          <ul className="space-y-3">
            {c.benefits.map((b, i) =>
            <li key={i} className="flex items-start gap-3 text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                {b}
              </li>
            )}
          </ul>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow p-8 mb-8 border border-green-200">
          <h2 className="text-xl font-bold text-[#1e3a5f] mb-5">{c.otcTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {c.otcItems.map((item, i) =>
            <div key={i} className="bg-white rounded-xl p-4 border border-green-100">
                <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-cyan-50 rounded-2xl p-8 mb-8 border border-cyan-100">
          <h2 className="text-xl font-bold text-[#1e3a5f] mb-3">{c.whoTitle}</h2>
          <p className="text-gray-600">{c.who}</p>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-2xl shadow p-8 mb-10">
          <h2 className="text-xl font-bold text-[#1e3a5f] mb-5">{c.compareTitle}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 text-gray-500 font-medium">Feature</th>
                  <th className="text-left py-2 pr-4 text-gray-500 font-medium">Original Medicare</th>
                  <th className="text-left py-2 text-cyan-700 font-medium">Medicare Advantage</th>
                </tr>
              </thead>
              <tbody>
                {c.compareItems.map((row, i) =>
                <tr key={i} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium text-gray-700">{row.label}</td>
                    <td className="py-3 pr-4 text-gray-500">{row.orig}</td>
                    <td className="py-3 text-gray-800 font-semibold">{row.adv}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <MedicareFAQ lang={lang} />

        <div className="bg-[#1e3a5f] rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">{c.ctaTitle}</h2>
          <p className="text-blue-200 mb-6">{c.ctaSub}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setQuoteOpen(true)}
              className="bg-white text-[#1e3a5f] font-bold rounded-full px-8 py-4 hover:bg-blue-50 transition-colors">

              {c.cta}
            </button>
            <a
              href="https://wa.me/18774582557"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#22c55e] text-white font-bold rounded-full px-8 py-4 hover:bg-[#16a34a] transition-colors">

              <MessageCircle className="w-5 h-5" /> {c.whatsapp}
            </a>
          </div>
        </div>

        <div className="text-center mt-8">
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="text-[#1e3a5f] text-sm font-semibold hover:underline">
            ↑ {lang === "es" ? "Volver arriba" : "Back to top"}
          </button>
        </div>
      </div>

      <Footer lang={lang} />
      <QuoteModal open={quoteOpen} onClose={() => setQuoteOpen(false)} ctaSource="instant_quote" lang={lang} />
    </div>);

}