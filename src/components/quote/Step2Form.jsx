import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, CheckCircle } from "lucide-react";

const copy = {
  en: {
    title: "Almost Done!",
    sub: "Help us find the best plan for you (optional)",
    product: "Insurance Type",
    lang: "Preferred Language",
    household: "Household Size",
    income: "Estimated Annual Income",
    coverage: "Current Coverage",
    doctors: "Current Doctors (optional)",
    prescriptions: "Prescriptions (optional)",
    notes: "Additional Notes (optional)",
    bestTime: "Best Time to Call",
    contactMethod: "Preferred Contact Method",
    skip: "Skip & Finish",
    submit: "Save Details →",
    products: ["ACA / Obamacare", "Medicare Advantage", "Life Insurance", "Dental & Vision"],
    times: ["Morning", "Afternoon", "Evening"],
    methods: ["Phone", "WhatsApp", "Email", "Text/SMS"],
    langs: ["English", "Spanish"],
  },
  es: {
    title: "¡Casi Listo!",
    sub: "Ayúdanos a encontrar el mejor plan para ti (opcional)",
    product: "Tipo de Seguro",
    lang: "Idioma Preferido",
    household: "Tamaño del Hogar",
    income: "Ingreso Anual Estimado",
    coverage: "Cobertura Actual",
    doctors: "Médicos Actuales (opcional)",
    prescriptions: "Medicamentos (opcional)",
    notes: "Notas Adicionales (opcional)",
    bestTime: "Mejor Hora para Llamar",
    contactMethod: "Método de Contacto Preferido",
    skip: "Omitir y Finalizar",
    submit: "Guardar Detalles →",
    products: ["ACA / Obamacare", "Medicare Advantage", "Life Insurance", "Dental & Vision"],
    times: ["Mañana", "Tarde", "Noche"],
    methods: ["Teléfono", "WhatsApp", "Email", "Texto/SMS"],
    langs: ["English", "Spanish"],
  }
};

export default function Step2Form({ lang, leadId, onDone }) {
  const c = copy[lang];
  const [form, setForm] = useState({
    product_type: "", preferred_language: "", household_size: "",
    estimated_income: "", current_coverage: "", doctors: "",
    prescriptions: "", notes: "", best_time_to_call: "", preferred_contact_method: ""
  });
  const [loading, setLoading] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (skip = false) => {
    setLoading(true);
    const leads = await base44.entities.Lead.filter({ lead_id: leadId });
    if (leads && leads.length > 0) {
      const updateData = { status: "completed" };
      if (!skip) {
        if (form.product_type) updateData.product_type = form.product_type;
        if (form.preferred_language) updateData.preferred_language = form.preferred_language;
        if (form.household_size) updateData.household_size = parseInt(form.household_size);
        if (form.estimated_income) updateData.estimated_income = parseInt(form.estimated_income);
        if (form.current_coverage) updateData.current_coverage = form.current_coverage;
        if (form.doctors) updateData.doctors = form.doctors;
        if (form.prescriptions) updateData.prescriptions = form.prescriptions;
        if (form.notes) updateData.notes = form.notes;
        if (form.best_time_to_call) updateData.best_time_to_call = form.best_time_to_call;
        if (form.preferred_contact_method) updateData.preferred_contact_method = form.preferred_contact_method;
      }
      await base44.entities.Lead.update(leads[0].id, updateData);
    }
    setLoading(false);
    onDone();
  };

  const selectField = (key, label, options) => (
    <div>
      <label className="block text-sm font-semibold text-[#1e3a5f] mb-1">{label}</label>
      <select
        value={form[key]}
        onChange={e => set(key, e.target.value)}
        className="w-full border border-gray-300 bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#2563eb]"
      >
        <option value="">—</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  const textField = (key, label, type = "text") => (
    <div>
      <label className="block text-sm font-semibold text-[#1e3a5f] mb-1">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => set(key, e.target.value)}
        className="w-full border border-gray-300 bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#2563eb]"
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="mb-2">
        <h2 className="text-xl font-extrabold text-[#1e3a5f]">{c.title}</h2>
        <p className="text-sm text-gray-500">{c.sub}</p>
      </div>

      {selectField("product_type", c.product, c.products)}
      {selectField("preferred_language", c.lang, c.langs)}
      <div className="grid grid-cols-2 gap-3">
        {textField("household_size", c.household, "number")}
        {textField("estimated_income", c.income, "number")}
      </div>
      {textField("current_coverage", c.coverage)}
      {textField("doctors", c.doctors)}
      {textField("prescriptions", c.prescriptions)}
      <div>
        <label className="block text-sm font-semibold text-[#1e3a5f] mb-1">{c.notes}</label>
        <textarea
          value={form.notes}
          onChange={e => set("notes", e.target.value)}
          rows={3}
          className="w-full border border-gray-300 bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#2563eb] resize-none"
        />
      </div>
      {selectField("best_time_to_call", c.bestTime, c.times)}
      {selectField("preferred_contact_method", c.contactMethod, c.methods)}

      <button
        onClick={() => handleSubmit(false)}
        disabled={loading}
        className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold rounded-xl py-4 text-base transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {c.submit}
      </button>
      <button
        onClick={() => handleSubmit(true)}
        disabled={loading}
        className="w-full text-gray-400 hover:text-gray-600 text-sm py-2 transition-colors"
      >
        {c.skip}
      </button>
    </div>
  );
}