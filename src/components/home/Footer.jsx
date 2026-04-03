import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Phone, MessageCircle, Shield, FileText, Lock, Mail, X } from "lucide-react";
import { submitSmsSubscribe } from "@/lib/publicIntakeApi";
import { createPageUrl } from "@/utils";


function SmsTermsModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        <h2 className="text-lg font-bold text-[#1e3a5f] mb-4">SMS Consent Terms</h2>
        <div className="text-sm text-gray-700 space-y-3 leading-relaxed">
          <p>By opting in to receive SMS communications from MLC Insurance Agency, you agree to receive text messages regarding your insurance inquiries, quotes, applications, policy updates, reminders, and customer care communications.</p>
          <p>Message frequency may vary. Message and data rates may apply.</p>
          <p>You may opt out of receiving text messages at any time by replying <strong>STOP</strong> to any message. For assistance, reply <strong>HELP</strong> or contact MLC Insurance Agency at <a href="tel:8774582557" className="text-blue-600 hover:underline">877-458-2557</a> or <a href="mailto:info@mlcinsuranceagency.com" className="text-blue-600 hover:underline">info@mlcinsuranceagency.com</a>.</p>
          <p>Your mobile opt-in information will not be shared, sold, or disclosed to third parties for marketing purposes. Consent to receive SMS messages is not required as a condition of purchasing any goods or services.</p>
        </div>
        <button onClick={onClose} className="mt-5 w-full bg-[#1e3a5f] text-white rounded-lg py-2 text-sm font-semibold hover:bg-[#163059] transition-colors">Close</button>
      </div>
    </div>
  );
}

const copy = {
  en: {
    tagline: "Helping families find the right coverage — no pressure, no obligation.",
    links: "Quick Links",
    legal: "Legal",
    contact: "Contact Us",
    terms: "Terms & Conditions",
    privacy: "Privacy Policy",
    hipaa: "HIPAA Notice",
    smsTitle: "Stay Informed",
    smsSub: "Get news and policy updates via SMS.",
    smsPlaceholder: "Your phone number",
    smsBtn: "Subscribe",
    smsConsent: "By subscribing, you consent to receive SMS messages from MLC Insurance regarding health insurance updates, open enrollment reminders, and policy news. Message & data rates may apply. Reply STOP to unsubscribe at any time.",
    smsSuccess: "You're subscribed! We'll keep you updated.",
    rights: "All rights reserved.",
    disclaimer: "MLC Insurance is an independent insurance agency. We are not affiliated with or endorsed by the U.S. government or the federal Medicare program.",
  },
  es: {
    tagline: "Ayudando a familias a encontrar la cobertura correcta — sin presión, sin compromiso.",
    links: "Enlaces Rápidos",
    legal: "Legal",
    contact: "Contáctanos",
    terms: "Términos y Condiciones",
    privacy: "Política de Privacidad",
    hipaa: "Aviso HIPAA",
    smsTitle: "Mantente Informado",
    smsSub: "Recibe noticias y actualizaciones de pólizas por SMS.",
    smsPlaceholder: "Tu número de teléfono",
    smsBtn: "Suscribirme",
    smsConsent: "Al suscribirte, consientes recibir mensajes SMS de MLC Insurance sobre actualizaciones de seguros, recordatorios de inscripción abierta y noticias de pólizas. Pueden aplicar tarifas de mensajes y datos. Responde STOP para darte de baja en cualquier momento.",
    smsSuccess: "¡Estás suscrito! Te mantendremos informado.",
    rights: "Todos los derechos reservados.",
    disclaimer: "MLC Insurance es una agencia de seguros independiente. No estamos afiliados ni respaldados por el gobierno de EE.UU. ni por el programa federal de Medicare.",
  }
};

export default function Footer({ lang = "en" }) {
  const c = copy[lang] || copy.en;
  const [phone, setPhone] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!phone.trim() || !agreedToTerms) return;
    setSubmitting(true);
    await submitSmsSubscribe({
      phone: phone.trim(),
      source: "footer",
    });
    setSubscribed(true);
    setSubmitting(false);
  };

  return (
    <footer className="bg-[#1e3a5f] text-white mt-16">
      {showTerms && <SmsTermsModal onClose={() => setShowTerms(false)} />}
      {/* Main footer content */}
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Brand */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69ab1578c293524eeeb25c69/34f395594_logo.png" alt="MLC Insurance" className="w-9 h-9 rounded-full object-cover" />
            <span className="font-bold text-lg">MLC Insurance</span>
          </div>
          <p className="text-blue-200 text-sm leading-relaxed">{c.tagline}</p>
          <div className="flex flex-col gap-2 mt-4">
            <a href="tel:8774582557" className="flex items-center gap-2 text-sm text-blue-100 hover:text-white transition-colors">
              <Phone className="w-4 h-4" /> 877-458-2557
            </a>
            <a href="https://wa.me/18774582557" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-100 hover:text-white transition-colors">
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
            <a href="mailto:info@mlcinsuranceagency.com" className="flex items-center gap-2 text-sm text-blue-100 hover:text-white transition-colors">
              <Mail className="w-4 h-4" /> info@mlcinsuranceagency.com
            </a>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <a href="https://www.facebook.com/profile.php?id=100093903970209" target="_blank" rel="noopener noreferrer" className="text-blue-200 hover:text-white transition-colors" aria-label="Facebook">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="https://www.instagram.com/saludesfortuna/" target="_blank" rel="noopener noreferrer" className="text-blue-200 hover:text-white transition-colors" aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a href="https://www.tiktok.com/@saludesfortuna" target="_blank" rel="noopener noreferrer" className="text-blue-200 hover:text-white transition-colors" aria-label="TikTok">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/></svg>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-bold text-sm uppercase tracking-wider text-blue-300 mb-3">{c.links}</h3>
          <ul className="space-y-2 text-sm text-blue-100">
            <li><Link to={createPageUrl("Home")} className="hover:text-white transition-colors">{lang === "es" ? "Inicio" : "Home"}</Link></li>
            <li><Link to={createPageUrl("Obamacare")} className="hover:text-white transition-colors">ACA / Obamacare</Link></li>
            <li><Link to={createPageUrl("MedicareAdvantage")} className="hover:text-white transition-colors">Medicare Advantage</Link></li>
            <li><Link to={createPageUrl("LifeInsurance")} className="hover:text-white transition-colors">Life Insurance</Link></li>
            <li><Link to={createPageUrl("DentalVision")} className="hover:text-white transition-colors">Dental & Vision</Link></li>
            <li><Link to={createPageUrl("ForBrokers")} className="hover:text-white transition-colors">{lang === "es" ? "Para Agentes" : "For Brokers"}</Link></li>
            <li><Link to="/News" className="hover:text-white transition-colors">{lang === "es" ? "Noticias" : "News"}</Link></li>
            <li><Link to="/News#social-services" className="hover:text-white transition-colors">{lang === "es" ? "Servicios Sociales" : "Social Services"}</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="font-bold text-sm uppercase tracking-wider text-blue-300 mb-3">{c.legal}</h3>
          <ul className="space-y-2 text-sm text-blue-100">
            <li>
              <Link to={createPageUrl("TermsAndConditions")} className="flex items-center gap-1.5 hover:text-white transition-colors">
                <FileText className="w-3.5 h-3.5" /> {c.terms}
              </Link>
            </li>
            <li>
              <Link to={createPageUrl("PrivacyPolicy")} className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Lock className="w-3.5 h-3.5" /> {c.privacy}
              </Link>
            </li>
            <li>
              <Link to={createPageUrl("HipaaNotice")} className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Shield className="w-3.5 h-3.5" /> {c.hipaa}
              </Link>
            </li>
          </ul>
        </div>

        {/* SMS Opt-In */}
        <div>
          <h3 className="font-bold text-sm uppercase tracking-wider text-blue-300 mb-1">{c.smsTitle}</h3>
          <p className="text-blue-200 text-xs mb-3">{c.smsSub}</p>
          {subscribed ? (
            <div className="bg-green-600/30 border border-green-500 rounded-xl px-4 py-3 text-sm text-green-200">
              ✓ {c.smsSuccess}
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-2">
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder={c.smsPlaceholder}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-blue-300 outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="submit"
                disabled={submitting || !agreedToTerms}
                className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white font-semibold rounded-lg px-4 py-2 text-sm transition-colors disabled:opacity-60"
              >
                {submitting ? "..." : c.smsBtn}
              </button>
              <label className="flex items-start gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={e => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 accent-[#22c55e] w-3.5 h-3.5 flex-shrink-0 cursor-pointer"
                />
                <span className="text-blue-200 text-[10px] leading-relaxed">
                  I agree to the{" "}
                  <button type="button" onClick={() => setShowTerms(true)} className="text-blue-400 hover:text-white underline underline-offset-2 transition-colors">
                    Terms & Conditions
                  </button>
                </span>
              </label>
              <p className="text-blue-300 text-[10px] leading-relaxed">{c.smsConsent}</p>
            </form>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-blue-300">
          <span>© {new Date().getFullYear()} MLC Insurance. {c.rights}</span>
          <span className="text-center md:text-right max-w-xl">{c.disclaimer}</span>
        </div>
      </div>
    </footer>
  );
}