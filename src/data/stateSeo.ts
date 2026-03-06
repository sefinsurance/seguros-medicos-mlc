export type StateSeo = {
  titleEs: string;
  titleEn: string;
  introEs: string;
  introEn: string;
  faqsEs: { q: string; a: string }[];
  faqsEn: { q: string; a: string }[];
  primaryCounties?: string[];
};

export const stateSeo: Record<string, StateSeo> = {
  florida: {
    titleEs: "Seguro médico en Florida",
    titleEn: "Health insurance in Florida",
    introEs:
      "En Florida, muchas familias hispanas pierden Medicaid, cambian de trabajo o necesitan un plan con prima baja. Te ayudamos a comparar opciones (ACA/Marketplace, Medicare, Dental y Vida) y elegir beneficios que sí uses.",
    introEn:
      "In Florida, many families lose Medicaid, change jobs, or need a low‑premium plan. We help you compare options (ACA/Marketplace, Medicare, Dental, Life) and choose benefits that fit your situation.",
    faqsEs: [
      { q: "¿Cuándo puedo inscribirme si perdí Medicaid?", a: "Si perdiste Medicaid o recibiste una carta de terminación, normalmente calificas para un Período Especial. Escríbenos por WhatsApp y te decimos qué aplica en tu caso." },
      { q: "¿Qué documentos necesitan para orientarme?", a: "Nombre, fecha de nacimiento, condado, ingreso estimado del hogar y si alguien tiene Medicare o Medicaid. Con eso empezamos." },
      { q: "¿Atienden en español?", a: "Sí. Te atendemos en español y te explicamos todo paso a paso." }
    ],
    faqsEn: [
      { q: "When can I enroll if I lost Medicaid?", a: "If you lost Medicaid or received a termination notice, you may qualify for a Special Enrollment Period. Message us and we’ll confirm what applies to you." },
      { q: "What do you need to guide me?", a: "Name, date of birth, county, estimated household income, and whether anyone has Medicare or Medicaid." },
      { q: "Do you help in Spanish?", a: "Yes. We can assist in Spanish and explain everything step by step." }
    ],
    primaryCounties: ["miami-dade","broward","palm-beach","orange","hillsborough","lee"]
  },

  texas: {
    titleEs: "Seguro médico en Texas",
    titleEn: "Health insurance in Texas",
    introEs:
      "En Texas, el Marketplace (ACA) puede ser una opción fuerte si no tienes seguro por el trabajo. Te ayudamos a comparar planes, doctores y beneficios, y a entender el costo real con créditos.",
    introEn:
      "In Texas, Marketplace (ACA) can be a strong option if you don’t have employer coverage. We help compare plans, doctors, and benefits—and the real cost after tax credits.",
    faqsEs: [
      { q: "¿Puedo tener ACA si tengo hijos y poco ingreso?", a: "Depende de tu situación y elegibilidad. Te ayudamos a revisar opciones sin perder ayudas cuando aplique." },
      { q: "¿Qué pasa si mi ingreso cambia durante el año?", a: "Se actualiza la aplicación para evitar sorpresas en impuestos. Te guiamos para reportarlo correctamente." },
      { q: "¿Puedo escoger plan por mi doctor?", a: "Sí. Revisamos redes y medicamentos para que el plan tenga sentido." }
    ],
    faqsEn: [
      { q: "Can I get ACA with kids and low income?", a: "It depends on eligibility and your situation. We’ll review options and help you keep assistance when you qualify." },
      { q: "What if my income changes during the year?", a: "You update the application to reduce tax surprises. We’ll guide you on the right way to report changes." },
      { q: "Can I pick a plan based on my doctor?", a: "Yes. We check networks and prescriptions so the plan actually fits." }
    ],
    primaryCounties: ["harris","dallas","bexar","travis","el-paso","hidalgo"]
  },

  "north-carolina": {
    titleEs: "Seguro médico en North Carolina",
    titleEn: "Health insurance in North Carolina",
    introEs:
      "Si estás en North Carolina y necesitas cobertura para tu familia, te ayudamos a comparar el Marketplace (ACA) y opciones suplementarias para bajar costos y protegerte de gastos grandes.",
    introEn:
      "If you’re in North Carolina and need coverage for your family, we help compare Marketplace (ACA) and supplemental options to reduce costs and protect against big medical bills.",
    faqsEs: [
      { q: "¿Cuánto cuesta normalmente un plan con crédito?", a: "Depende del ingreso, edades y condado. Te damos un estimado claro antes de inscribirte." },
      { q: "¿Puedo agregar Dental o Visión?", a: "Sí. Podemos revisar opciones que tengan sentido para tu presupuesto." },
      { q: "¿Atienden por teléfono o WhatsApp?", a: "WhatsApp suele ser lo más rápido. También podemos llamarte si lo prefieres." }
    ],
    faqsEn: [
      { q: "How much does a plan cost after credits?", a: "It depends on income, ages, and county. We give a clear estimate before you enroll." },
      { q: "Can I add Dental or Vision?", a: "Yes. We can review add‑on options that fit your budget." },
      { q: "Do you help by phone or WhatsApp?", a: "WhatsApp is usually fastest. We can also call you if you prefer." }
    ],
    primaryCounties: ["mecklenburg","wake","guilford","durham"]
  },

  "south-carolina": {
    titleEs: "Seguro médico en South Carolina",
    titleEn: "Health insurance in South Carolina",
    introEs:
      "En South Carolina, muchas familias necesitan una solución simple: comparar planes claros, costos reales y beneficios útiles. Te ayudamos a elegir con confianza.",
    introEn:
      "In South Carolina, many families want a simple path: clear plan comparisons, real costs, and practical benefits. We help you choose with confidence.",
    faqsEs: [
      { q: "¿Me ayudan a comparar planes rápido?", a: "Sí. En minutos te mostramos 2–4 opciones buenas según tu situación." },
      { q: "¿Qué es el máximo de gasto (out‑of‑pocket)?", a: "Es el tope anual que pagarías en servicios cubiertos. Te explicamos cómo funciona en la vida real." },
      { q: "¿Puedo cubrir a mis hijos?", a: "Sí. Revisamos opciones familiares y redes pediátricas." }
    ],
    faqsEn: [
      { q: "Can you help me compare plans fast?", a: "Yes. In minutes, we can narrow down 2–4 strong options based on your situation." },
      { q: "What is the out‑of‑pocket max?", a: "It’s the annual cap you pay for covered services. We explain how it works in real life." },
      { q: "Can I cover my kids?", a: "Yes. We review family options and pediatric networks." }
    ],
    primaryCounties: ["greenville","richland","charleston","horry"]
  },

  tennessee: {
    titleEs: "Seguro médico en Tennessee",
    titleEn: "Health insurance in Tennessee",
    introEs:
      "En Tennessee, te ayudamos a conseguir cobertura sin complicarte: Marketplace (ACA), Medicare si aplica, y opciones de Dental/Vida para proteger tu presupuesto.",
    introEn:
      "In Tennessee, we help you get coverage without the headache: Marketplace (ACA), Medicare when applicable, plus Dental/Life options to protect your budget.",
    faqsEs: [
      { q: "¿Puedo inscribirme si estoy entre trabajos?", a: "Sí. Dependiendo de tu situación, puedes calificar por pérdida de cobertura o por período de inscripción." },
      { q: "¿Me ayudan con medicamentos?", a: "Sí. Revisamos formularios y alternativas para reducir costos." },
      { q: "¿Cuánto tardan en ayudarme?", a: "Normalmente podemos darte opciones el mismo día por WhatsApp." }
    ],
    faqsEn: [
      { q: "Can I enroll if I’m between jobs?", a: "Often yes. Depending on your situation, you may qualify due to loss of coverage or an enrollment window." },
      { q: "Do you help with prescriptions?", a: "Yes. We check formularies and alternatives to reduce costs." },
      { q: "How fast can you help?", a: "Usually we can share options the same day over WhatsApp." }
    ],
    primaryCounties: ["davidson","shelby","knox","hamilton"]
  }
};
