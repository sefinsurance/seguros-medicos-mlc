import React from "react";
import { CheckCircle, MessageCircle, Phone } from "lucide-react";

const copy = {
  en: {
    title: "You're All Set!",
    sub: "A licensed MLC Insurance agent will contact you shortly. No obligation.",
    whatsapp: "Chat on WhatsApp Now",
    call: "Call 877-458-2557",
    close: "Close",
    reassure: "🔒 Your information is secure and will never be sold.",
  },
  es: {
    title: "¡Todo Listo!",
    sub: "Un agente licenciado de MLC Insurance te contactará pronto. Sin compromiso.",
    whatsapp: "Chatear por WhatsApp",
    call: "Llamar 877-458-2557",
    close: "Cerrar",
    reassure: "🔒 Tu información está segura y nunca será vendida.",
  }
};

export default function QuoteSuccess({ lang, onClose }) {
  const c = copy[lang];
  return (
    <div className="text-center py-4 space-y-5">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
      <h2 className="text-2xl font-extrabold text-[#1e3a5f]">{c.title}</h2>
      <p className="text-gray-600">{c.sub}</p>

      <div className="flex flex-col gap-3">
        <a
          href="https://wa.me/18774582557"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-[#22c55e] text-white font-bold rounded-xl py-4 text-base hover:bg-[#16a34a] transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          {c.whatsapp}
        </a>
        <a
          href="tel:8774582557"
          className="flex items-center justify-center gap-2 bg-[#1e3a5f] text-white font-bold rounded-xl py-4 text-base hover:bg-[#162d4a] transition-colors"
        >
          <Phone className="w-5 h-5" />
          {c.call}
        </a>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-sm py-2 transition-colors"
        >
          {c.close}
        </button>
      </div>

      <p className="text-xs text-gray-400">{c.reassure}</p>
    </div>
  );
}