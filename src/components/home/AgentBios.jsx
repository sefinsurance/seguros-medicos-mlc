import React from "react";
import { Shield, Star, CheckCircle, Globe, Award } from "lucide-react";

const copy = {
  en: {
    sectionBadge: "Meet Your Agent",
    sectionTitle: "Agent Spotlight",
    sectionSub: "We don't just connect you with insurance — we connect you with a real person who genuinely cares about your family's future.",
    verifiedBadge: "Verified Licensed Agent",
    experience: "Years of Experience",
    states: "Licensed & Contracted with Every Major Carrier",
    specialties: "Specialties",
    languages: "Languages",
    rating: "Client Rating",
    reviews: "reviews",
    bio: `Manuel has been helping families navigate the complex world of health and life insurance since 2006 — over 20 years of dedicated service. Born in Cuba and fluent in both English and Spanish, he brings a unique empathy and cultural understanding to every client conversation.

He doesn't just find you a plan. He takes the time to understand your family's needs, explains every option in plain language, and goes the extra mile to make sure you feel confident and protected. To Manuel, every client is family.`,
    certifications: ["ACA/Marketplace Certified", "Medicare Advantage Certified", "Life & Health Licensed", "CMS FFM Certified"],
  },
  es: {
    sectionBadge: "Conoce a Tu Agente",
    sectionTitle: "Agente Destacado",
    sectionSub: "No solo te conectamos con seguros — te conectamos con una persona real que genuinamente se preocupa por el futuro de tu familia.",
    verifiedBadge: "Agente Licenciado Verificado",
    experience: "Años de Experiencia",
    states: "Licenciado y Contratado con Todos los Principales Carriers",
    specialties: "Especialidades",
    languages: "Idiomas",
    rating: "Calificación de Clientes",
    reviews: "reseñas",
    bio: `Manuel lleva desde 2006 ayudando a familias a navegar el complejo mundo de los seguros de salud y vida — más de 20 años de servicio dedicado. Nacido en Cuba y bilingüe en inglés y español, aporta una empatía única y comprensión cultural a cada conversación con sus clientes.

No solo te consigue un plan. Se toma el tiempo de entender las necesidades de tu familia, explica cada opción en un lenguaje claro, y hace todo lo posible para que te sientas seguro y protegido. Para Manuel, cada cliente es familia.`,
    certifications: ["Certificado ACA/Marketplace", "Certificado Medicare Advantage", "Licencia de Vida y Salud", "Certificado CMS FFM"],
  }
};

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-4 h-4 ${i <= Math.floor(rating) ? "text-amber-400 fill-amber-400" : i - 0.5 <= rating ? "text-amber-400 fill-amber-200" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
}

export default function AgentBios({ lang = "en" }) {
  const c = copy[lang] || copy.en;

  return (
    <section className="py-16 px-4" style={{ background: "linear-gradient(160deg, #f0f6ff 0%, #e8f1fb 100%)" }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full px-4 py-2 mb-4">
            <Shield className="w-4 h-4" /> {c.sectionBadge}
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1e3a5f] mb-3">{c.sectionTitle}</h2>
          <p className="text-gray-500 max-w-xl mx-auto">{c.sectionSub}</p>
        </div>

        {/* Agent Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-blue-100">
          <div className="flex flex-col md:flex-row">

            {/* Left: Photo + stats */}
            <div className="text-white md:w-72 flex-shrink-0 flex flex-col items-center p-8" style={{ background: "linear-gradient(to bottom, #b0c4d8 0%, #ddeaf5 40%, #c8daea 60%, #1e3a5f 100%)" }}>
              {/* Avatar */}
              <div className="w-36 h-36 rounded-full overflow-hidden mb-4 flex-shrink-0" style={{ filter: "brightness(0.92) contrast(1.05) saturate(0.9)", boxShadow: "0 8px 32px 0 rgba(0,0,0,0.45), 0 2px 8px 0 rgba(0,0,0,0.3), inset 0 -4px 12px rgba(0,0,0,0.2)" }}>
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69ab1578c293524eeeb25c69/7f8995cb0_MF.jpg"
                  alt="Manuel Fernandez"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <h3 className="text-xl font-extrabold text-center mb-1 text-gray-900">Manuel Fernandez</h3>
              <div className="flex items-center gap-1.5 bg-green-500 text-white text-xs font-bold rounded-full px-3 py-1 mb-5">
                <CheckCircle className="w-3.5 h-3.5" /> {c.verifiedBadge}
              </div>

              {/* Stats */}
              <div className="w-full space-y-4">
                <div className="bg-[#1e3a5f]/80 rounded-xl p-3 text-center border border-white/20">
                  <div className="text-3xl font-extrabold text-white">20+</div>
                  <div className="text-blue-200 text-xs mt-0.5">{c.experience}</div>
                </div>
                <div className="bg-[#1e3a5f]/80 rounded-xl p-3 text-center border border-white/20">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Globe className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-bold text-white">All Carriers</span>
                  </div>
                  <div className="text-blue-200 text-xs">{c.states}</div>
                </div>
                <div className="bg-[#1e3a5f]/80 rounded-xl p-3 text-center border border-white/20">
                  <StarRating rating={4.5} />
                  <div className="text-white font-bold mt-1">4.5 <span className="text-blue-200 font-normal text-xs">({c.rating})</span></div>
                </div>
              </div>
            </div>

            {/* Right: Bio + details */}
            <div className="flex-1 p-8">
              {/* Bio */}
              <p className="text-gray-600 leading-relaxed mb-6 whitespace-pre-line text-sm md:text-base">{c.bio}</p>

              {/* Specialties */}
              <div className="mb-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">{c.specialties}</h4>
                <div className="flex flex-wrap gap-2">
                  {["Medicare Advantage", "ACA / Obamacare", "Life Insurance"].map(s => (
                    <span key={s} className="bg-blue-50 text-[#1e3a5f] text-sm font-semibold px-3 py-1 rounded-full border border-blue-100">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div className="mb-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">{c.languages}</h4>
                <div className="flex gap-2">
                  <span className="bg-amber-50 text-amber-700 text-sm font-semibold px-3 py-1 rounded-full border border-amber-100">English</span>
                  <span className="bg-amber-50 text-amber-700 text-sm font-semibold px-3 py-1 rounded-full border border-amber-100">Español</span>
                </div>
              </div>

              {/* Certifications */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  <Award className="w-3.5 h-3.5 inline mr-1" />Certifications & Licenses
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {c.certifications.map(cert => (
                    <div key={cert} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {cert}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}