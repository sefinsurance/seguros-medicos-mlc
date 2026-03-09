import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = {
  en: [
  {
    q: "What is the Open Enrollment Period?",
    a: "The Open Enrollment Period (OEP) typically runs from November 1 to January 15. During this time, you can sign up for, change, or cancel an ACA/Obamacare health plan. Outside of this window, you may still qualify through a Special Enrollment Period (SEP) if you've had a qualifying life event."
  },
  {
    q: "Do I qualify for Obamacare (ACA) subsidies?",
    a: "You may qualify for premium tax credits if your household income is between 100% and 400% of the federal poverty level. Many people are surprised to find they qualify for low or even $0/month plans. Our agents can check your eligibility instantly."
  },
  {
    q: "What is the difference between ACA and Medicare?",
    a: "ACA (Obamacare) is for individuals and families under 65 who need health coverage. Medicare is a federal program primarily for people 65 and older, or those with certain disabilities. Our agents can help you determine which program is right for you."
  },
  {
    q: "What does health insurance typically cover?",
    a: "Most ACA plans cover doctor visits, hospital stays, emergency care, prescription drugs, mental health services, preventive care, and more. The specifics vary by plan — our agents will walk you through what each plan covers before you enroll."
  },
  {
    q: "Can I keep my current doctor?",
    a: "It depends on the plan's network. When we help you compare plans, we check whether your preferred doctors and specialists are included in the network so there are no surprises."
  },
  {
    q: "How quickly can I get covered?",
    a: "If you enroll by the 15th of the month, coverage typically starts the 1st of the following month. In some special enrollment situations, coverage can begin sooner. Contact us and we'll find the fastest path to coverage for you."
  }],

  es: [
  {
    q: "¿Qué es el Período de Inscripción Abierta?",
    a: "El Período de Inscripción Abierta generalmente va del 1 de noviembre al 15 de enero. Durante este tiempo puedes inscribirte, cambiar o cancelar un plan de salud ACA/Obamacare. Fuera de este período, puedes calificar mediante un Período de Inscripción Especial si tuviste un evento de vida calificado."
  },
  {
    q: "¿Califico para subsidios de Obamacare (ACA)?",
    a: "Puedes calificar para créditos fiscales si el ingreso de tu hogar está entre el 100% y el 400% del nivel federal de pobreza. Muchas personas se sorprenden al descubrir que califican para planes de bajo costo o incluso de $0 al mes. Nuestros agentes pueden verificar tu elegibilidad de inmediato."
  },
  {
    q: "¿Cuál es la diferencia entre ACA y Medicare?",
    a: "El ACA (Obamacare) es para personas y familias menores de 65 años que necesitan cobertura médica. Medicare es un programa federal principalmente para personas de 65 años o más, o con ciertas discapacidades. Nuestros agentes te ayudarán a determinar qué programa es el adecuado para ti."
  },
  {
    q: "¿Qué cubre típicamente el seguro de salud?",
    a: "La mayoría de los planes ACA cubren visitas al médico, hospitalizaciones, atención de emergencia, medicamentos recetados, salud mental, atención preventiva y más. Los detalles varían según el plan — nuestros agentes te explicarán qué cubre cada plan antes de inscribirte."
  },
  {
    q: "¿Puedo conservar a mi médico actual?",
    a: "Depende de la red del plan. Cuando te ayudamos a comparar planes, verificamos si tus médicos y especialistas preferidos están incluidos en la red para evitar sorpresas."
  },
  {
    q: "¿Qué tan rápido puedo tener cobertura?",
    a: "Si te inscribes antes del día 15 del mes, la cobertura generalmente comienza el 1 del mes siguiente. En algunos casos de inscripción especial, puede comenzar antes. Contáctanos y encontraremos la forma más rápida de darte cobertura."
  }]

};

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left font-semibold text-[#1e3a5f] hover:bg-blue-50 transition-colors">

        <span>{question}</span>
        <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open &&
      <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
          {answer}
        </div>
      }
    </div>);

}

export default function FAQSection({ lang }) {
  const items = faqs[lang] || faqs.en;
  return (
    <section className="py-16 px-4 max-w-3xl mx-auto">
      <h2 className="text-3xl font-extrabold text-[#1e3a5f] text-center mb-2">
        {lang === "es" ? "Preguntas Frecuentes" : "Frequently Asked Questions"}
      </h2>
      <p className="text-gray-700 mb-10 text-sm text-center">
        {lang === "es" ?
        "Respuestas claras a las dudas más comunes sobre seguros de salud." :
        "Clear answers to the most common questions about health insurance."}
      </p>
      <div className="space-y-3">
        {items.map((item, i) =>
        <FAQItem key={i} question={item.q} answer={item.a} />
        )}
      </div>
    </section>);

}