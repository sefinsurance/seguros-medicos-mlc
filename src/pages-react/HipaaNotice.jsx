import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ContactBar from "../components/home/ContactBar";
import Footer from "../components/home/Footer";
import { createPageUrl } from "@/utils";

const copy = {
  en: {
    title: "HIPAA Notice of Privacy Practices",
    lastUpdated: "Last updated: March 2026",
    intro: "This notice describes how health information about you may be used and disclosed and how you can get access to this information. Please review it carefully.",
    sections: [
      {
        heading: "Our Legal Duty",
        body: "MLC Insurance Agency is required by law to maintain the privacy of protected health information (PHI) and to provide individuals with notice of our legal duties and privacy practices with respect to PHI. We are required to abide by the terms of the notice currently in effect."
      },
      {
        heading: "What Is Protected Health Information (PHI)?",
        body: "Protected Health Information (PHI) includes any individually identifiable health information, such as your name, date of birth, health conditions, prescription information, or insurance details that we collect in connection with insurance-related services."
      },
      {
        heading: "How We May Use and Disclose Your PHI",
        body: "We may use and disclose your PHI for the following purposes: (1) Treatment – to coordinate care with your healthcare providers; (2) Payment – to assist with insurance billing and enrollment; (3) Health Care Operations – to evaluate and improve the quality of our services; (4) As required by law – to comply with legal obligations, court orders, or government regulations."
      },
      {
        heading: "Uses and Disclosures Requiring Your Authorization",
        body: "Other uses and disclosures of your PHI not described in this notice will be made only with your written authorization. You may revoke this authorization at any time by contacting us in writing, except to the extent that we have already taken action in reliance upon it."
      },
      {
        heading: "Your Rights Regarding Your PHI",
        body: "You have the following rights with respect to your PHI: (1) Right to Inspect and Copy – you may request access to your PHI; (2) Right to Request an Amendment – you may request corrections to your PHI; (3) Right to an Accounting of Disclosures – you may request a list of certain disclosures we have made; (4) Right to Request Restrictions – you may ask us to limit how we use or disclose your PHI; (5) Right to Request Confidential Communications – you may request that we communicate with you in a specific way."
      },
      {
        heading: "Safeguarding Your Information",
        body: "We take the privacy and security of your health information seriously. We use administrative, technical, and physical safeguards to protect your PHI from unauthorized access, use, or disclosure."
      },
      {
        heading: "Changes to This Notice",
        body: "We reserve the right to change this notice at any time. We reserve the right to make the revised or changed notice effective for PHI we already have about you as well as any information we receive in the future. We will post a copy of the current notice on our website."
      },
      {
        heading: "Complaints",
        body: "If you believe your privacy rights have been violated, you may file a complaint with us or with the U.S. Department of Health and Human Services. You will not be retaliated against for filing a complaint. To file a complaint with us, contact: info@mlcinsuranceagency.com or 877-458-2557."
      },
      {
        heading: "Contact Information",
        body: "For questions about this HIPAA Notice or to exercise any of your rights, please contact MLC Insurance Agency at info@mlcinsuranceagency.com or call 877-458-2557."
      }
    ]
  },
  es: {
    title: "Aviso de Prácticas de Privacidad HIPAA",
    lastUpdated: "Última actualización: marzo de 2026",
    intro: "Este aviso describe cómo se puede usar y divulgar la información de salud sobre usted y cómo puede obtener acceso a esta información. Por favor, léalo detenidamente.",
    sections: [
      {
        heading: "Nuestro Deber Legal",
        body: "MLC Insurance Agency está obligado por ley a mantener la privacidad de la información de salud protegida (PHI, por sus siglas en inglés) y a proporcionar a las personas un aviso de nuestros deberes legales y prácticas de privacidad con respecto a la PHI. Estamos obligados a cumplir con los términos del aviso actualmente en vigencia."
      },
      {
        heading: "¿Qué es la Información de Salud Protegida (PHI)?",
        body: "La Información de Salud Protegida (PHI) incluye cualquier información de salud individualmente identificable, como su nombre, fecha de nacimiento, condiciones de salud, información sobre medicamentos o detalles de seguro que recopilamos en relación con los servicios relacionados con seguros."
      },
      {
        heading: "Cómo Podemos Usar y Divulgar su PHI",
        body: "Podemos usar y divulgar su PHI para los siguientes fines: (1) Tratamiento – para coordinar la atención con sus proveedores de salud; (2) Pago – para ayudar con la facturación e inscripción de seguros; (3) Operaciones de Atención Médica – para evaluar y mejorar la calidad de nuestros servicios; (4) Según lo requiera la ley – para cumplir con obligaciones legales, órdenes judiciales o regulaciones gubernamentales."
      },
      {
        heading: "Usos y Divulgaciones que Requieren su Autorización",
        body: "Otros usos y divulgaciones de su PHI no descritos en este aviso se realizarán únicamente con su autorización escrita. Puede revocar esta autorización en cualquier momento contactándonos por escrito, excepto en la medida en que ya hayamos tomado medidas basadas en ella."
      },
      {
        heading: "Sus Derechos con Respecto a su PHI",
        body: "Tiene los siguientes derechos con respecto a su PHI: (1) Derecho a Inspeccionar y Copiar – puede solicitar acceso a su PHI; (2) Derecho a Solicitar una Enmienda – puede solicitar correcciones a su PHI; (3) Derecho a un Registro de Divulgaciones – puede solicitar una lista de ciertas divulgaciones que hemos realizado; (4) Derecho a Solicitar Restricciones – puede pedirnos que limitemos cómo usamos o divulgamos su PHI; (5) Derecho a Solicitar Comunicaciones Confidenciales – puede solicitar que nos comuniquemos con usted de una manera específica."
      },
      {
        heading: "Protección de su Información",
        body: "Nos tomamos en serio la privacidad y seguridad de su información de salud. Utilizamos salvaguardas administrativas, técnicas y físicas para proteger su PHI del acceso, uso o divulgación no autorizados."
      },
      {
        heading: "Cambios a Este Aviso",
        body: "Nos reservamos el derecho de cambiar este aviso en cualquier momento. Nos reservamos el derecho de hacer que el aviso revisado o modificado sea efectivo para la PHI que ya tenemos sobre usted, así como para cualquier información que recibamos en el futuro. Publicaremos una copia del aviso actual en nuestro sitio web."
      },
      {
        heading: "Quejas",
        body: "Si cree que sus derechos de privacidad han sido violados, puede presentar una queja ante nosotros o ante el Departamento de Salud y Servicios Humanos de los EE. UU. No se tomará represalias contra usted por presentar una queja. Para presentar una queja ante nosotros, contáctenos en: info@mlcinsuranceagency.com o al 877-458-2557."
      },
      {
        heading: "Información de Contacto",
        body: "Para preguntas sobre este Aviso HIPAA o para ejercer cualquiera de sus derechos, contáctenos en info@mlcinsuranceagency.com o llame al 877-458-2557."
      }
    ]
  }
};

export default function HipaaNotice() {
  const [lang, setLang] = useState("en");
  const c = copy[lang];

  return (
    <div className="min-h-screen bg-gray-50">
      <ContactBar lang={lang} setLang={setLang} />
      <div className="max-w-3xl mx-auto px-4 py-14">
        <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-[#1e3a5f] font-semibold hover:underline mb-8 block">
          <ArrowLeft className="w-4 h-4" /> {lang === "es" ? "Volver al inicio" : "Return to Home"}
        </Link>
        <h1 className="text-4xl font-extrabold text-[#1e3a5f] mb-2">{c.title}</h1>
        <p className="text-sm text-gray-400 mb-4">{c.lastUpdated}</p>
        <p className="text-gray-600 italic mb-10 border-l-4 border-[#1e3a5f] pl-4">{c.intro}</p>
        <div className="space-y-8">
          {c.sections.map((s, i) => (
            <div key={i}>
              <h2 className="text-lg font-bold text-[#1e3a5f] mb-2">{s.heading}</h2>
              <p className="text-gray-700 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
        <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-[#1e3a5f] font-semibold hover:underline mt-10 block">
          <ArrowLeft className="w-4 h-4" /> {lang === "es" ? "Volver al inicio" : "Return to Home"}
        </Link>
      </div>
      <Footer lang={lang} />
    </div>
  );
}