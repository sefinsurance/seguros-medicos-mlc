import React from "react";
import { Link } from "react-router-dom";
import { Phone, Lock } from "lucide-react";
import { createPageUrl } from "@/utils";

const t = {
  en: { tagline: "• We speak Spanish • Family-friendly, no pressure", slogan: "Health Insurance for the whole family." },
  es: { tagline: "• Se habla español • Atención familiar y sin presión", slogan: "Seguro de salud para toda la familia." }
};

export default function ContactBar({ lang, setLang }) {
  return (
    <header className="bg-[#035582] shadow-sm sticky top-0 z-50">
      <div className="bg-[#035582] text-slate-50 mx-auto px-4 py-3 max-w-6xl flex items-center justify-between flex-wrap gap-2">
        {/* Logo */}
        <Link to={createPageUrl("Home")} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69ab1578c293524eeeb25c69/34f395594_logo.png" alt="MLC Insurance" className="w-10 h-10 rounded-full object-cover" />
          <div>
            <div className="text-[#ffffff] text-base font-bold leading-tight">MLC Insurance</div>
            <div className="text-slate-50 text-xs">{t[lang]?.slogan}</div>
          </div>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#1e3a5f]">
          
          
          
          
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === "en" ? "es" : "en")} className="bg-slate-50 text-[#1e3a5f] px-3 py-1 text-xs font-semibold rounded-full border border-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white transition-colors">


            {lang === "en" ? "ES" : "EN"}
          </button>
          <a
            href="tel:8774582557"
            className="flex items-center gap-2 bg-[#22c55e] text-white font-semibold rounded-full px-4 py-2 text-sm hover:bg-[#16a34a] transition-colors">
            <Phone className="w-4 h-4" />
            877-458-2557
          </a>
          <a
            href="https://office.obamacarelocal.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white border border-white/30 font-semibold rounded-full px-3 py-2 text-xs transition-colors">
            <Lock className="w-3 h-3" />
            Login
          </a>
        </div>
      </div>
    </header>);

}