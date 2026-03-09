import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const products = (lang) => [
  {
    icon: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69ab1578c293524eeeb25c69/c1d829513_aca.png",
    title: lang === "es" ? "Obamacare (ACA)" : "Obamacare (ACA)",
    sub: lang === "es" ? "Subsidios y planes del Marketplace" : "Marketplace plans & subsidies",
    page: "Obamacare",
  },
  {
    icon: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69ab1578c293524eeeb25c69/3fa770cda_medicare.png",
    title: lang === "es" ? "Medicare Advantage" : "Medicare Advantage",
    sub: lang === "es" ? "MA/MAPD y ventanas de inscripción" : "MA/MAPD & enrollment windows",
    page: "MedicareAdvantage",
  },
  {
    icon: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69ab1578c293524eeeb25c69/319c49af2_life.png",
    title: lang === "es" ? "Seguro de Vida" : "Life Insurance",
    sub: lang === "es" ? "Protege tu familia" : "Protect your family",
    page: "LifeInsurance",
  },
  {
    icon: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69ab1578c293524eeeb25c69/65cbb5f3f_dental.png",
    title: lang === "es" ? "Dental y Visión" : "Dental & Vision",
    sub: lang === "es" ? "Planes combinados" : "Combined plans",
    page: "DentalVision",
  },
];

const learnMore = { en: "Learn More →", es: "Más información →" };

export default function ProductCards({ lang }) {
  return (
    <section className="py-12 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
        {products(lang).map((p, i) => (
          <Link
            key={i}
            to={createPageUrl(p.page)}
            className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-center gap-3"
          >
            <img src={p.icon} alt={p.title} className="w-24 h-24 object-contain" />
            <div className="font-bold text-[#1e3a5f] text-sm">{p.title}</div>
            <div className="text-xs text-gray-500">{p.sub}</div>
            <span className="text-xs font-semibold text-[#3b82f6] mt-1">{learnMore[lang]}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}