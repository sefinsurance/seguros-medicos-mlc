import React, { useState } from "react";
import { ArrowRight, Users, DollarSign, FileText, PhoneCall } from "lucide-react";

export default function Step2Form({ lang = "en", leadId, onDone }) {
  const [formData, setFormData] = useState({
    preferred_language: lang,
    household_size: "",
    estimated_income: "",
    current_coverage: "",
    doctors: "",
    prescriptions: "",
    notes: "",
    best_time_to_call: "",
    preferred_contact_method: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const t = {
    en: {
      title: "A few more details",
      subtitle: "Help us match you better",
      household: "Household Size",
      income: "Estimated Household Income",
      coverage: "Current Coverage",
      doctors: "Preferred Doctors",
      prescriptions: "Prescriptions",
      notes: "Additional Notes",
      bestTime: "Best Time to Call",
      contactMethod: "Preferred Contact Method",
      phone: "Phone",
      email: "Email",
      text: "Text",
      finish: "Finish",
      failed: "Could not submit Step 2. Please try again.",
    },
    es: {
      title: "Algunos detalles más",
      subtitle: "Ayúdanos a orientarte mejor",
      household: "Tamaño del hogar",
      income: "Ingreso estimado del hogar",
      coverage: "Cobertura actual",
      doctors: "Doctores preferidos",
      prescriptions: "Medicamentos",
      notes: "Notas adicionales",
      bestTime: "Mejor hora para llamar",
      contactMethod: "Método de contacto preferido",
      phone: "Teléfono",
      email: "Correo",
      text: "Texto",
      finish: "Finalizar",
      failed: "No se pudo enviar el Paso 2. Inténtalo otra vez.",
    },
  };

  const copy = t[lang] || t.en;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("https://mlcagency.base44.app/functions/webhookStep2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lead_id: leadId,
          product_type: "",
          preferred_language: formData.preferred_language,
          household_size: formData.household_size,
          estimated_income: formData.estimated_income,
          current_coverage: formData.current_coverage,
          doctors: formData.doctors,
          prescriptions: formData.prescriptions,
          notes: formData.notes,
          best_time_to_call: formData.best_time_to_call,
          preferred_contact_method: formData.preferred_contact_method,
        }),
      });

      if (!response.ok) {
        throw new Error(`Step 2 failed: ${response.status}`);
      }

      await response.json();
      onDone();
    } catch (err) {
      console.error("Step 2 webhook error:", err);
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
          <Users className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            name="household_size"
            value={formData.household_size}
            onChange={handleChange}
            placeholder={copy.household}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none"
          />
        </div>

        <div className="relative">
          <DollarSign className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            name="estimated_income"
            value={formData.estimated_income}
            onChange={handleChange}
            placeholder={copy.income}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none"
          />
        </div>

        <input
          type="text"
          name="current_coverage"
          value={formData.current_coverage}
          onChange={handleChange}
          placeholder={copy.coverage}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none"
        />

        <input
          type="text"
          name="doctors"
          value={formData.doctors}
          onChange={handleChange}
          placeholder={copy.doctors}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none"
        />

        <input
          type="text"
          name="prescriptions"
          value={formData.prescriptions}
          onChange={handleChange}
          placeholder={copy.prescriptions}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none"
        />

        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder={copy.notes}
          rows="3"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none"
        />

        <div className="relative">
          <PhoneCall className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            name="best_time_to_call"
            value={formData.best_time_to_call}
            onChange={handleChange}
            placeholder={copy.bestTime}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none"
          />
        </div>

        <select
          name="preferred_contact_method"
          value={formData.preferred_contact_method}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none"
        >
          <option value="">{copy.contactMethod}</option>
          <option value="phone">{copy.phone}</option>
          <option value="email">{copy.email}</option>
          <option value="text">{copy.text}</option>
        </select>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-gradient-to-r from-[#1e3a5f] to-[#2563eb] text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {submitting ? "..." : copy.finish}
          {!submitting && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}
