import React, { useState } from "react";
import { ArrowRight, User, Phone, Mail, MapPin, Cake } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

export default function Step1Form({ lang = "en", ctaSource = "website", onDone }) {
  const [formData, setFormData] = useState({
    full_name: "",
    date_of_birth: "",
    phone: "",
    email: "",
    zip_code: "",
    product_type: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const t = {
    en: {
      title: "Let's get started",
      subtitle: "Tell us a little about yourself",
      name: "Full Name",
      dob: "Date of Birth",
      phone: "Phone Number",
      email: "Email Address",
      zip: "ZIP Code",
      product: "What are you looking for?",
      aca: "ACA / Obamacare",
      medicare: "Medicare Advantage",
      life: "Life Insurance",
      dental: "Dental & Vision",
      next: "Continue",
      required: "Please fill in all required fields.",
      failed: "Could not submit Step 1. Please try again.",
    },
    es: {
      title: "Comencemos",
      subtitle: "Cuéntanos un poco sobre ti",
      name: "Nombre completo",
      dob: "Fecha de nacimiento",
      phone: "Número de teléfono",
      email: "Correo electrónico",
      zip: "Código postal",
      product: "¿Qué estás buscando?",
      aca: "ACA / Obamacare",
      medicare: "Medicare Advantage",
      life: "Seguro de Vida",
      dental: "Dental y Visión",
      next: "Continuar",
      required: "Por favor completa todos los campos requeridos.",
      failed: "No se pudo enviar el Paso 1. Inténtalo otra vez.",
    },
  };

  const copy = t[lang] || t.en;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const handlePhoneChange = (e) => {
    setFormData((prev) => ({ ...prev, phone: formatPhone(e.target.value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !formData.full_name ||
      !formData.date_of_birth ||
      !formData.phone ||
      !formData.email ||
      !formData.zip_code ||
      !formData.product_type
    ) {
      setError(copy.required);
      return;
    }

    const leadId = uuidv4();
    setSubmitting(true);

    try {
      const response = await fetch("https://mlcagency.base44.app/functions/webhookStep1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lead_id: leadId,
          full_name: formData.full_name,
          date_of_birth: formData.date_of_birth,
          phone: formData.phone,
          email: formData.email,
          zip_code: formData.zip_code,
          product_type: formData.product_type,
          cta_source: ctaSource,
          source_page: "astro_site",
          language_selected: lang,
        }),
      });

      if (!response.ok) {
        throw new Error(`Step 1 failed: ${response.status}`);
      }

      await response.json();
      onDone(leadId);
    } catch (err) {
      console.error("Step 1 webhook error:", err);
      setError(copy.failed);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">{copy.title}</h2>
        <p className="text-gray-600">{copy.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            placeholder={copy.name}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none"
            required
          />
        </div>

        <div className="relative">
          <Cake className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none"
            required
          />
        </div>

        <div className="relative">
          <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handlePhoneChange}
            placeholder={copy.phone}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none"
            required
          />
        </div>

        <div className="relative">
          <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={copy.email}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none"
            required
          />
        </div>

        <div className="relative">
          <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            name="zip_code"
            value={formData.zip_code}
            onChange={handleChange}
            placeholder={copy.zip}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none"
            required
          />
        </div>

        <select
          name="product_type"
          value={formData.product_type}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none"
          required
        >
          <option value="">{copy.product}</option>
          <option value="ACA / Obamacare">{copy.aca}</option>
          <option value="Medicare Advantage">{copy.medicare}</option>
          <option value="Life Insurance">{copy.life}</option>
          <option value="Dental & Vision">{copy.dental}</option>
        </select>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-gradient-to-r from-[#1e3a5f] to-[#2563eb] text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {submitting ? "..." : copy.next}
          {!submitting && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}
