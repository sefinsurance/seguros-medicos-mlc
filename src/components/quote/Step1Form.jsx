import React, { useState } from "react";
import { submitQuoteStep1 } from "@/lib/publicIntakeApi";
import { Loader2 } from "lucide-react";

const PRODUCT_OPTIONS = [
  { value: "ACA",          label_en: "Affordable Care Act (Obamacare)", label_es: "Ley de Cuidado de Salud Asequible (Obamacare)" },
  { value: "Medicare",     label_en: "Medicare",                        label_es: "Medicare" },
  { value: "Dental",       label_en: "Dental",                          label_es: "Dental" },
  { value: "Vision",       label_en: "Vision",                          label_es: "Visión" },
  { value: "Life",         label_en: "Life Insurance",                  label_es: "Seguro de Vida" },
  { value: "Supplemental", label_en: "Supplemental / Hospital",         label_es: "Suplementario / Hospital" },
];

const copy = {
  en: {
    title: "Get Your Free Quote",
    sub: "Quick and easy — no obligation",
    fullName: "Full Name",
    dob: "Date of Birth",
    phone: "Phone Number",
    email: "Email Address",
    zip: "ZIP Code",
    productType: "What type of insurance are you looking for?",
    productPlaceholder: "Select Insurance Type",
    btn: "Confirm & Continue →",
    consent: "By submitting this form, you agree to be contacted by phone, text, or email regarding your insurance inquiry.",
    errors: {
      fullName: "Please enter your full name",
      dob: "Please enter a valid date of birth",
      phone: "Please enter a valid phone number",
      email: "Please enter a valid email",
      zip: "Please enter a 5-digit ZIP code",
      product_type: "Please select an insurance type",
    }
  },
  es: {
    title: "Obtén tu Cotización Gratis",
    sub: "Rápido y fácil — sin compromiso",
    fullName: "Nombre Completo",
    dob: "Fecha de Nacimiento",
    phone: "Número de Teléfono",
    email: "Correo Electrónico",
    zip: "Código Postal",
    productType: "¿Qué tipo de seguro estás buscando?",
    productPlaceholder: "Selecciona el Tipo de Seguro",
    btn: "Confirmar y Continuar →",
    consent: "Al enviar este formulario, aceptas ser contactado por teléfono, texto o correo electrónico sobre tu consulta de seguro.",
    errors: {
      fullName: "Por favor ingresa tu nombre completo",
      dob: "Por favor ingresa una fecha de nacimiento válida",
      phone: "Por favor ingresa un número de teléfono válido",
      email: "Por favor ingresa un correo electrónico válido",
      zip: "Por favor ingresa un código postal de 5 dígitos",
      product_type: "Por favor selecciona un tipo de seguro",
    }
  }
};

function generateLeadId() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `lead_${date}_${rand}`;
}

export default function Step1Form({ lang, ctaSource, onDone }) {
  const c = copy[lang] || copy.en;
  const [form, setForm] = useState({ full_name: "", date_of_birth: "", phone: "", email: "", zip_code: "", product_type: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.full_name.trim() || form.full_name.trim().length < 2) e.full_name = c.errors.fullName;
    if (!form.date_of_birth) e.date_of_birth = c.errors.dob;
    if (!form.phone.replace(/\D/g, "") || form.phone.replace(/\D/g, "").length < 10) e.phone = c.errors.phone;
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = c.errors.email;
    if (!form.zip_code || !/^\d{5}$/.test(form.zip_code.trim())) e.zip_code = c.errors.zip;
    if (!form.product_type) e.product_type = c.errors.product_type;
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    const lead_external_id = generateLeadId();
    try {
      await submitQuoteStep1({
        lead_external_id,
        status: "partial_confirmed",
        cta_source: ctaSource || "",
        source_page: window.location.pathname,
        language_selected: lang,
        full_name: form.full_name.trim(),
        date_of_birth: form.date_of_birth,
        phone: form.phone.trim(),
        email: form.email.trim().toLowerCase(),
        zip_code: form.zip_code.trim(),
        product_type: form.product_type,
      });
    } catch (error) {
      console.error("Error creating lead:", error);
      setLoading(false);
      return;
    }
    setLoading(false);
    onDone(lead_external_id);
  };

  const field = (key, label, type = "text", placeholder = "") => (
    <div>
      <label className="block text-sm font-semibold text-[#1e3a5f] mb-1">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => { setForm(f => ({ ...f, [key]: e.target.value })); setErrors(er => ({ ...er, [key]: undefined })); }}
        placeholder={placeholder}
        className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-[#2563eb] ${errors[key] ? "border-red-400 bg-red-50" : "border-gray-300 bg-gray-50"}`}
      />
      {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-2">
        <h2 className="text-xl font-extrabold text-[#1e3a5f]">{c.title}</h2>
        <p className="text-sm text-gray-500">{c.sub}</p>
      </div>
      {field("full_name", c.fullName, "text", "Maria Lopez")}
      {field("date_of_birth", c.dob, "date")}
      {field("phone", c.phone, "tel", "(239) 555-1212")}
      {field("email", c.email, "email", "maria@example.com")}
      {field("zip_code", c.zip, "text", "33971")}

      {/* Product Type — required */}
      <div>
        <label className="block text-sm font-semibold text-[#1e3a5f] mb-1">{c.productType}</label>
        <select
          value={form.product_type}
          onChange={e => { setForm(f => ({ ...f, product_type: e.target.value })); setErrors(er => ({ ...er, product_type: undefined })); }}
          className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-[#2563eb] bg-gray-50 ${errors.product_type ? "border-red-400 bg-red-50" : "border-gray-300"}`}
        >
          <option value="">{c.productPlaceholder}</option>
          {PRODUCT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>
              {lang === "es" ? o.label_es : o.label_en}
            </option>
          ))}
        </select>
        {errors.product_type && <p className="text-red-500 text-xs mt-1">{errors.product_type}</p>}
      </div>

      <p className="text-xs text-gray-400 leading-relaxed">{c.consent}</p>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold rounded-xl py-4 text-base transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {c.btn}
      </button>
    </form>
  );
}
