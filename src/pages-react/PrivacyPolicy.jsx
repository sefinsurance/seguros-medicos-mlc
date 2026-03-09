import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ContactBar from "../components/home/ContactBar";
import Footer from "../components/home/Footer";
import { createPageUrl } from "@/utils";

const copy = {
  en: {
    title: "Privacy Policy",
    lastUpdated: "Last updated: March 2026",
    sections: [
      {
        heading: "1. Information We Collect",
        body: "We collect personal information you provide directly, such as your name, date of birth, phone number, email address, zip code, and health insurance preferences when you submit a quote request or contact form. We may also collect non-personal data such as browser type, device information, and usage data through cookies and analytics tools."
      },
      {
        heading: "2. How We Use Your Information",
        body: "We use your personal information to provide insurance quotes, connect you with licensed agents, send you relevant updates about plans and open enrollment, and improve our services. We may contact you via phone, SMS, email, or WhatsApp based on your preferences."
      },
      {
        heading: "3. Information Sharing",
        body: "We do not sell your personal information to third parties. We may share your information with licensed insurance carriers and partners solely for the purpose of providing you with insurance quotes and services. All partners are required to handle your data in accordance with applicable privacy laws."
      },
      {
        heading: "4. SMS Communications",
        body: "If you opt in to receive SMS messages, your mobile phone number will not be shared, sold, or disclosed to third parties for marketing purposes. You may opt out at any time by replying STOP to any message."
      },
      {
        heading: "5. Data Security",
        body: "We implement reasonable technical and organizational measures to protect your personal information from unauthorized access, disclosure, or loss. However, no method of internet transmission is 100% secure, and we cannot guarantee absolute security."
      },
      {
        heading: "6. Cookies",
        body: "Our website may use cookies to enhance user experience, track usage patterns, and improve functionality. You may disable cookies through your browser settings, though some features of the site may be affected."
      },
      {
        heading: "7. Your Rights",
        body: "You have the right to request access to, correction of, or deletion of your personal information we hold. To exercise these rights, please contact us at info@mlcinsuranceagency.com or call 877-458-2557."
      },
      {
        heading: "8. Children's Privacy",
        body: "Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from minors. If you believe a minor has provided us with personal data, please contact us immediately."
      },
      {
        heading: "9. Changes to This Policy",
        body: "We may update this Privacy Policy from time to time. We will notify users of significant changes by posting a notice on our website. Your continued use of our services after changes are posted constitutes acceptance."
      },
      {
        heading: "10. Contact Us",
        body: "For questions or concerns about this Privacy Policy, contact us at info@mlcinsuranceagency.com or 877-458-2557."
      }
    ]
  },
  es: {
    title: "Política de Privacidad",
    lastUpdated: "Última actualización: marzo de 2026",
    sections: [
      {
        heading: "1. Información que Recopilamos",
        body: "Recopilamos información personal que usted proporciona directamente, como su nombre, fecha de nacimiento, número de teléfono, correo electrónico, código postal y preferencias de seguro de salud cuando envía una solicitud de cotización o formulario de contacto. También podemos recopilar datos no personales como tipo de navegador, información del dispositivo y datos de uso a través de cookies y herramientas de análisis."
      },
      {
        heading: "2. Cómo Usamos su Información",
        body: "Usamos su información personal para proporcionar cotizaciones de seguros, conectarlo con agentes con licencia, enviarle actualizaciones relevantes sobre planes e inscripción abierta, y mejorar nuestros servicios. Podemos contactarle por teléfono, SMS, correo electrónico o WhatsApp según sus preferencias."
      },
      {
        heading: "3. Compartir Información",
        body: "No vendemos su información personal a terceros. Podemos compartir su información con aseguradoras y socios con licencia únicamente con el fin de proporcionarle cotizaciones y servicios de seguros. Todos los socios están obligados a manejar sus datos de acuerdo con las leyes de privacidad aplicables."
      },
      {
        heading: "4. Comunicaciones por SMS",
        body: "Si opta por recibir mensajes SMS, su número de teléfono móvil no será compartido, vendido ni divulgado a terceros con fines de marketing. Puede darse de baja en cualquier momento respondiendo STOP a cualquier mensaje."
      },
      {
        heading: "5. Seguridad de Datos",
        body: "Implementamos medidas técnicas y organizativas razonables para proteger su información personal del acceso no autorizado, divulgación o pérdida. Sin embargo, ningún método de transmisión por Internet es 100% seguro y no podemos garantizar una seguridad absoluta."
      },
      {
        heading: "6. Cookies",
        body: "Nuestro sitio web puede usar cookies para mejorar la experiencia del usuario, rastrear patrones de uso y mejorar la funcionalidad. Puede deshabilitar las cookies a través de la configuración de su navegador, aunque algunas funciones del sitio pueden verse afectadas."
      },
      {
        heading: "7. Sus Derechos",
        body: "Tiene derecho a solicitar acceso, corrección o eliminación de su información personal que tenemos en nuestro poder. Para ejercer estos derechos, contáctenos en info@mlcinsuranceagency.com o llame al 877-458-2557."
      },
      {
        heading: "8. Privacidad de Menores",
        body: "Nuestros servicios no están dirigidos a personas menores de 18 años. No recopilamos información personal de menores de manera intencional. Si cree que un menor nos ha proporcionado datos personales, contáctenos de inmediato."
      },
      {
        heading: "9. Cambios a Esta Política",
        body: "Podemos actualizar esta Política de Privacidad de vez en cuando. Notificaremos a los usuarios de cambios significativos publicando un aviso en nuestro sitio web. Su uso continuado de nuestros servicios después de que se publiquen los cambios constituye aceptación."
      },
      {
        heading: "10. Contáctenos",
        body: "Para preguntas o inquietudes sobre esta Política de Privacidad, contáctenos en info@mlcinsuranceagency.com o al 877-458-2557."
      }
    ]
  }
};

export default function PrivacyPolicy() {
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