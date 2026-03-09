import React, { useState } from "react";
import { Star, CheckCircle, ArrowLeft, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import QuoteModal from "@/components/quote/QuoteModal";
import ContactBar from "@/components/home/ContactBar";
import Footer from "@/components/home/Footer";

export default function LifeInsurance() {
  const [lang, setLang] = useState("en");
  const [quoteOpen, setQuoteOpen] = useState(false);

  const content = {
    en: {
      back: "Back to Home",
      badge: "Life Insurance",
      title: "Is Your Family Protected?",
      sub: "It's not a comfortable question. But it's the most important one. Life insurance isn't about death — it's about making sure the people who depend on you never have to struggle financially if you're no longer there.",
      whyTitle: "What Life Insurance Protects",
      benefits: [
        "🏠 Mortgage or rent payments — so your family keeps their home",
        "🎓 Your children's education — so their future isn't derailed",
        "🛒 Daily living expenses — groceries, utilities, and more",
        "⚰️ Funeral & burial costs — averaging $10,000–$15,000",
        "💳 Debts & loans — so your family doesn't inherit your financial burden",
        "👨‍👩‍👧 Income replacement — years of your salary, tax-free, delivered to your family",
        "💰 Whole life builds cash value — a living asset you can borrow against",
        "📈 Term life starts at just dollars a day — affordable at any budget",
      ],
      realityTitle: "The Reality Most Families Don't Plan For",
      reality: "70% of families would struggle financially within one month of losing their primary earner. The average funeral costs over $10,000. Student loans, car payments, and mortgages don't pause for grief. A $500,000 life insurance policy can cost less than your daily coffee — and it guarantees your family's stability no matter what.",
      whoTitle: "This Is For You If...",
      who: "You have a spouse, children, or aging parents who depend on your income. You have a mortgage, car loan, or any debt. You're a business owner with employees or partners. You want to leave something behind — a legacy, not a burden. The younger and healthier you are today, the lower your rate. Every day you wait costs more.",
      ctaTitle: "Give Your Family the Gift of Security",
      ctaSub: "A 10-minute conversation could protect your family for decades. No obligation — just real answers.",
      cta: "Protect My Family Now",
      whatsapp: "Chat on WhatsApp",
      testimonialsTitle: "Real Stories. Real Peace of Mind.",
      testimonials: [
        { name: "Maria S.", role: "Widow, 2 Children", text: "When my husband passed, I was terrified about how I'd pay the mortgage and keep my kids in school. His life insurance saved us. I can't imagine what we would have done without it." },
        { name: "James T.", role: "Single Parent", text: "As a single dad, I needed to know my kids would be taken care of. Getting life insurance was one of the best decisions I ever made. It gives me real peace every single day." },
        { name: "Angela M.", role: "Single Mom, 3 Kids", text: "I kept putting it off, thinking it was too expensive. But when I got the quote, it was so affordable. Now my kids have security, and I have peace of mind. That's priceless." },
      ],
    },
    es: {
      back: "Volver al inicio",
      badge: "Seguro de Vida",
      title: "¿Está Protegida Tu Familia?",
      sub: "No es una pregunta cómoda. Pero es la más importante. El seguro de vida no se trata de la muerte — se trata de asegurarse de que las personas que dependen de ti nunca tengan que luchar financieramente si ya no estás.",
      whyTitle: "Qué Protege el Seguro de Vida",
      benefits: [
        "🏠 Hipoteca o renta — para que tu familia conserve su hogar",
        "🎓 Educación de tus hijos — para que su futuro no se vea truncado",
        "🛒 Gastos diarios — comida, servicios y más",
        "⚰️ Gastos funerarios — con un promedio de $10,000–$15,000",
        "💳 Deudas y préstamos — para que tu familia no herede tu carga financiera",
        "👨‍👩‍👧 Reemplazo de ingresos — años de tu salario, libre de impuestos, para tu familia",
        "💰 La vida entera acumula valor en efectivo — un activo del que puedes pedir prestado",
        "📈 La vida a término comienza en solo centavos al día — accesible para cualquier presupuesto",
      ],
      realityTitle: "La Realidad Que la Mayoría de las Familias No Planifica",
      reality: "El 70% de las familias tendría dificultades financieras en el primer mes de perder a su principal sostén. El funeral promedio cuesta más de $10,000. Las deudas, pagos del auto e hipoteca no se detienen por el duelo. Una póliza de $500,000 puede costar menos que tu café diario — y garantiza la estabilidad de tu familia pase lo que pase.",
      whoTitle: "Esto Es Para Ti Si...",
      who: "Tienes cónyuge, hijos o padres mayores que dependen de tus ingresos. Tienes hipoteca, préstamo de auto o cualquier deuda. Eres dueño de un negocio con empleados o socios. Quieres dejar algo — un legado, no una carga. Cuanto más joven y saludable estés hoy, menor será tu tarifa. Cada día que esperas cuesta más.",
      ctaTitle: "Dale a Tu Familia el Regalo de la Seguridad",
      ctaSub: "Una conversación de 10 minutos puede proteger a tu familia por décadas. Sin compromiso — solo respuestas reales.",
      cta: "Proteger a Mi Familia Ahora",
      whatsapp: "Hablar por WhatsApp",
      testimonialsTitle: "Historias Reales. Tranquilidad Real.",
      testimonials: [
        { name: "María S.", role: "Viuda, 2 Hijos", text: "Cuando mi esposo falleció, tenía miedo de cómo pagaría la hipoteca y mantendría a mis hijos en la escuela. Su seguro de vida nos salvó. No puedo imaginar qué habríamos hecho sin él." },
        { name: "James T.", role: "Padre Soltero", text: "Como padre soltero, necesitaba saber que mis hijos estarían cuidados. Obtener un seguro de vida fue una de las mejores decisiones que tomé. Me da paz real cada día." },
        { name: "Ángela M.", role: "Madre Soltera, 3 Hijos", text: "Lo posponía, pensando que era muy caro. Pero cuando obtuve la cotización, era muy asequible. Ahora mis hijos tienen seguridad, y yo tengo tranquilidad. Eso no tiene precio." },
      ],
    }
  };

  const c = content[lang];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
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

        {/* Reality Check */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-bold text-red-800 mb-3">💡 {c.realityTitle}</h2>
          <p className="text-red-900">{c.reality}</p>
        </div>

        <div className="bg-indigo-50 rounded-2xl p-8 mb-10 border border-indigo-100">
          <h2 className="text-xl font-bold text-[#1e3a5f] mb-3">{c.whoTitle}</h2>
          <p className="text-gray-600">{c.who}</p>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-bold text-[#1e3a5f] text-center mb-8">{c.testimonialsTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {c.testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl shadow p-6 border-l-4 border-[#1e3a5f]">
                <p className="text-gray-700 italic mb-4">"{t.text}"</p>
                <div className="font-semibold text-[#1e3a5f]">{t.name}</div>
                <div className="text-sm text-gray-500">{t.role}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1e3a5f] rounded-2xl p-8 text-white text-center">
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