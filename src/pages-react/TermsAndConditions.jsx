import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ContactBar from "../components/home/ContactBar";
import Footer from "../components/home/Footer";
import { createPageUrl } from "@/utils";

const copy = {
  en: {
    title: "Terms & Conditions",
    lastUpdated: "Last updated: March 2026",
    sections: [
      {
        heading: "1. Acceptance of Terms",
        body: "By accessing or using the MLC Insurance Agency website and services, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our services."
      },
      {
        heading: "2. Services Description",
        body: "MLC Insurance Agency is an independent insurance agency that helps individuals and families compare and enroll in health insurance plans, including ACA/Obamacare, Medicare Advantage, Life Insurance, and Dental & Vision plans. We are licensed insurance agents and brokers."
      },
      {
        heading: "3. No Guarantee of Coverage",
        body: "Information provided on this website is for general informational purposes only and does not constitute a guarantee of coverage, eligibility, or premium amounts. Actual plan details, pricing, and availability are subject to carrier approval and may vary by location."
      },
      {
        heading: "4. Personal Information",
        body: "By submitting a quote request or contact form, you consent to being contacted by MLC Insurance Agency via phone, text, email, or WhatsApp regarding insurance products and services. You may opt out at any time by contacting us directly or replying STOP to any text message."
      },
      {
        heading: "5. Third-Party Links",
        body: "Our website may contain links to third-party websites. MLC Insurance Agency is not responsible for the content, privacy practices, or accuracy of any third-party site. Visiting these links is at your own risk."
      },
      {
        heading: "6. Intellectual Property",
        body: "All content on this website, including text, logos, images, and graphics, is the property of MLC Insurance Agency and is protected by applicable copyright and trademark laws. Unauthorized use is prohibited."
      },
      {
        heading: "7. Limitation of Liability",
        body: "MLC Insurance Agency shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of this website or our services. We make no warranties, express or implied, regarding the accuracy or completeness of any information provided."
      },
      {
        heading: "8. Changes to Terms",
        body: "We reserve the right to modify these Terms and Conditions at any time. Changes will be effective upon posting to the website. Your continued use of our services constitutes acceptance of any updated terms."
      },
      {
        heading: "9. Governing Law",
        body: "These Terms and Conditions are governed by the laws of the State of Florida. Any disputes shall be resolved in the courts of competent jurisdiction in Florida."
      },
      {
        heading: "10. Contact Us",
        body: "If you have any questions about these Terms and Conditions, please contact us at info@mlcinsuranceagency.com or call 877-458-2557."
      }
    ]
  },
  es: {
    title: "Términos y Condiciones",
    lastUpdated: "Última actualización: marzo de 2026",
    sections: [
      {
        heading: "1. Aceptación de los Términos",
        body: "Al acceder o utilizar el sitio web y los servicios de MLC Insurance Agency, usted acepta estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, le pedimos que no utilice nuestros servicios."
      },
      {
        heading: "2. Descripción de los Servicios",
        body: "MLC Insurance Agency es una agencia de seguros independiente que ayuda a personas y familias a comparar e inscribirse en planes de seguro de salud, incluyendo ACA/Obamacare, Medicare Advantage, Seguro de Vida y planes de Dental y Visión. Somos agentes y corredores de seguros con licencia."
      },
      {
        heading: "3. Sin Garantía de Cobertura",
        body: "La información proporcionada en este sitio web es únicamente para fines informativos generales y no constituye una garantía de cobertura, elegibilidad o montos de prima. Los detalles reales del plan, precios y disponibilidad están sujetos a la aprobación de la aseguradora y pueden variar según la ubicación."
      },
      {
        heading: "4. Información Personal",
        body: "Al enviar una solicitud de cotización o formulario de contacto, usted consiente ser contactado por MLC Insurance Agency por teléfono, mensaje de texto, correo electrónico o WhatsApp sobre productos y servicios de seguros. Puede cancelar la suscripción en cualquier momento contactándonos directamente o respondiendo STOP a cualquier mensaje de texto."
      },
      {
        heading: "5. Enlaces de Terceros",
        body: "Nuestro sitio web puede contener enlaces a sitios web de terceros. MLC Insurance Agency no es responsable del contenido, las prácticas de privacidad o la exactitud de ningún sitio de terceros. La visita a estos enlaces es bajo su propio riesgo."
      },
      {
        heading: "6. Propiedad Intelectual",
        body: "Todo el contenido de este sitio web, incluyendo texto, logotipos, imágenes y gráficos, es propiedad de MLC Insurance Agency y está protegido por las leyes de derechos de autor y marcas registradas aplicables. El uso no autorizado está prohibido."
      },
      {
        heading: "7. Limitación de Responsabilidad",
        body: "MLC Insurance Agency no será responsable de ningún daño directo, indirecto, incidental o consecuente derivado del uso de este sitio web o de nuestros servicios. No hacemos ninguna garantía, expresa o implícita, con respecto a la exactitud o integridad de la información proporcionada."
      },
      {
        heading: "8. Cambios a los Términos",
        body: "Nos reservamos el derecho de modificar estos Términos y Condiciones en cualquier momento. Los cambios serán efectivos al publicarse en el sitio web. Su uso continuado de nuestros servicios constituye la aceptación de los términos actualizados."
      },
      {
        heading: "9. Ley Aplicable",
        body: "Estos Términos y Condiciones se rigen por las leyes del Estado de Florida. Cualquier disputa se resolverá en los tribunales de jurisdicción competente en Florida."
      },
      {
        heading: "10. Contáctenos",
        body: "Si tiene alguna pregunta sobre estos Términos y Condiciones, contáctenos en info@mlcinsuranceagency.com o llame al 877-458-2557."
      }
    ]
  }
};

export default function TermsAndConditions() {
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
        <p className="text-sm text-gray-400 mb-10">{c.lastUpdated}</p>
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