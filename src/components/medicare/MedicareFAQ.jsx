import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = {
  en: [
    {
      q: "Can I keep my current doctors with Medicare Advantage?",
      a: "Yes — and if you ever need to change doctors, we can help make that happen. Just give us a call and we'll work with your plan to find the right provider for you."
    },
    {
      q: "Can I change or switch my plan if it doesn't meet my medical needs?",
      a: "Absolutely. Plans can be replaced or updated as needed to ensure you have access to the treatments and specialists you need. It only takes a phone call — we'll confirm all available options with you."
    },
    {
      q: "Can you help me find local doctors and specialists?",
      a: "Yes! We actively assist clients in finding local primary care doctors and specialists that match their specific care criteria and are in-network with their plan."
    },
    {
      q: "Can you help me renew my Medicaid or Food Stamp benefits?",
      a: "Yes — we assist clients with the renewal of Medicaid and SNAP (Food Stamp) benefits. We'll guide you through the process and help ensure your coverage stays uninterrupted."
    },
    {
      q: "Do you offer any additional social services?",
      a: "We do! MLC Insurance has a dedicated Social Services Department to assist our clients beyond just insurance. Whether it's connecting you to community resources, government programs, or other support services — we're here to help."
    },
    {
      q: "Is there a cost to getting help from your agents?",
      a: "No. Our licensed agents provide free consultations and plan comparisons. We are compensated by the insurance carriers — never by you."
    },
    {
      q: "When can I enroll in a Medicare Advantage plan?",
      a: "You can enroll during the Annual Enrollment Period (October 15 – December 7), or during a Special Enrollment Period if you qualify due to a life event such as moving, losing other coverage, or turning 65."
    },
  ],
  es: [
    {
      q: "¿Puedo conservar mis médicos actuales con Medicare Advantage?",
      a: "Sí — y si en algún momento necesitas cambiar de médico, podemos ayudarte. Solo llámanos y trabajaremos con tu plan para encontrar el proveedor adecuado para ti."
    },
    {
      q: "¿Puedo cambiar mi plan si no cubre mis necesidades médicas?",
      a: "Absolutamente. Los planes pueden reemplazarse o actualizarse según sea necesario para garantizar que tengas acceso a los tratamientos y especialistas que necesitas. Solo toma una llamada telefónica — te confirmaremos todas las opciones disponibles."
    },
    {
      q: "¿Pueden ayudarme a encontrar médicos y especialistas locales?",
      a: "¡Sí! Ayudamos activamente a nuestros clientes a encontrar médicos de atención primaria y especialistas locales que cumplan con sus criterios de atención y estén en la red de su plan."
    },
    {
      q: "¿Pueden ayudarme a renovar mis beneficios de Medicaid o Estampillas de Comida?",
      a: "Sí — asistimos a nuestros clientes en la renovación de los beneficios de Medicaid y SNAP (Estampillas de Comida). Te guiaremos en el proceso y ayudaremos a asegurar que tu cobertura no se interrumpa."
    },
    {
      q: "¿Ofrecen servicios sociales adicionales?",
      a: "¡Sí! MLC Insurance cuenta con un Departamento de Servicios Sociales dedicado para ayudar a nuestros clientes más allá del seguro. Ya sea conectándote con recursos comunitarios, programas gubernamentales u otros servicios de apoyo — estamos aquí para ayudar."
    },
    {
      q: "¿Tiene algún costo recibir ayuda de sus agentes?",
      a: "No. Nuestros agentes licenciados ofrecen consultas y comparaciones de planes de forma gratuita. Somos compensados por las aseguradoras — nunca por ti."
    },
    {
      q: "¿Cuándo puedo inscribirme en un plan Medicare Advantage?",
      a: "Puedes inscribirte durante el Período de Inscripción Anual (15 de octubre – 7 de diciembre), o durante un Período de Inscripción Especial si calificas debido a un evento de vida como mudanza, pérdida de otra cobertura o cumplir 65 años."
    },
  ]
};

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-cyan-100 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 bg-white hover:bg-cyan-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-[#1e3a5f] text-sm md:text-base">{q}</span>
        <ChevronDown className={`w-5 h-5 text-cyan-600 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-5 py-4 bg-cyan-50 border-t border-cyan-100 text-gray-900 text-sm leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
}

export default function MedicareFAQ({ lang = "en" }) {
  const items = faqs[lang] || faqs.en;
  return (
    <div className="bg-white rounded-2xl shadow p-8 mb-8">
      <div className="flex items-center gap-2 mb-6">
        <HelpCircle className="w-5 h-5 text-cyan-600" />
        <h2 className="text-xl font-bold text-[#1e3a5f]">
          {lang === "es" ? "Preguntas Frecuentes" : "Frequently Asked Questions"}
        </h2>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <FAQItem key={i} q={item.q} a={item.a} />
        ))}
      </div>
    </div>
  );
}