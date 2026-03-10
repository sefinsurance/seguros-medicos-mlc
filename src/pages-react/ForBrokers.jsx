import React, { useState } from "react";
import ContactBar from "@/components/home/ContactBar";
import Footer from "@/components/home/Footer";
import { ArrowRight, Briefcase, Mail, Phone, MapPin, Award, ShieldCheck, Handshake } from "lucide-react";

export default function ForBrokers() {
  const [lang, setLang] = useState("en");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    state: "",
    years_experience: "",
    license_types: "",
    carriers: "",
    message: "",
  });

  const copy = {
    en: {
      badge: "For Brokers",
      title: "Grow with MLC Insurance",
      subtitle:
        "We’re looking for motivated brokers who want support, opportunity, and real partnership.",
      applyTitle: "Apply to Partner With Us",
      fullName: "Full Name",
      email: "Email Address",
      phone: "Phone Number",
      state: "State",
      experience: "Years of Experience",
      licenses: "License Types",
      carriers: "Current Carriers",
      message: "Tell us about yourself",
      submit: "Submit Application",
      success: "Thanks — your broker application has been submitted.",
      failed: "Could not submit your application right now. Please try again.",
      perksTitle: "Why partner with us?",
      perks: [
        "Supportive, growth-focused environment",
        "Opportunities in ACA, Medicare, Life, and ancillary products",
        "Bilingual market reach",
        "Fast-moving, entrepreneurial team"
      ]
    },
    es: {
      badge: "Para Agentes",
      title: "Crece con MLC Insurance",
      subtitle:
        "Buscamos agentes motivados que quieran apoyo, oportunidad y una alianza real.",
      applyTitle: "Solicita ser parte de nuestro equipo",
      fullName: "Nombre completo",
      email: "Correo electrónico",
      phone: "Número de teléfono",
      state: "Estado",
      experience: "Años de experiencia",
      licenses: "Tipos de licencia",
      carriers: "Compañías actuales",
      message: "Cuéntanos sobre ti",
      submit: "Enviar solicitud",
      success: "Gracias — tu solicitud fue enviada.",
      failed: "No se pudo enviar la solicitud. Inténtalo otra vez.",
      perksTitle: "¿Por qué trabajar con nosotros?",
      perks: [
        "Ambiente de apoyo y crecimiento",
        "Oportunidades en ACA, Medicare, Vida y productos complementarios",
        "Alcance bilingüe del mercado",
        "Equipo emprendedor y ágil"
      ]
    }
  };

  const c = copy[lang] || copy.en;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("https://mlcagency.base44.app/functions/webhookBrokerSignup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error(`Broker signup failed: ${response.status}`);
      }

      await response.json();
      setSubmitted(true);
    } catch (err) {
      console.error("Broker signup error:", err);
      setError(c.failed);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(160deg, #ebf5ff 0%, #dae8f6 50%, #d4e3f4 100%)" }}
    >
      <ContactBar lang={lang} setLang={setLang} />

      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
              <Briefcase className="w-3.5 h-3.5" /> {c.badge}
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-[#1e3a5f] leading-tight mb-5">
              {c.title}
            </h1>

            <p className="text-slate-600 text-lg mb-8 max-w-2xl">
              {c.subtitle}
            </p>

            <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-8">
              <h2 className="text-2xl font-bold text-[#1e3a5f] mb-5">{c.perksTitle}</h2>

              <div className="space-y-4">
                {c.perks.map((item, index) => {
                  const icons = [
                    <Handshake key="h" className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />,
                    <ShieldCheck key="s" className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />,
                    <Award key="a" className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />,
                    <Briefcase key="b" className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />,
                  ];
                  return (
                    <div key={item} className="flex items-start gap-3 text-slate-700">
                      {icons[index % icons.length]}
                      <span>{item}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-8">
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-6">{c.applyTitle}</h2>

            {submitted ? (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-2xl px-5 py-4 text-sm">
                ✓ {c.success}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    placeholder={c.fullName}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder={c.email}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder={c.phone}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder={c.state}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none"
                  />
                </div>

                <input
                  type="text"
                  name="years_experience"
                  value={form.years_experience}
                  onChange={handleChange}
                  placeholder={c.experience}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none"
                />

                <input
                  type="text"
                  name="license_types"
                  value={form.license_types}
                  onChange={handleChange}
                  placeholder={c.licenses}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none"
                />

                <input
                  type="text"
                  name="carriers"
                  value={form.carriers}
                  onChange={handleChange}
                  placeholder={c.carriers}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none"
                />

                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder={c.message}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none"
                />

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-[#1e3a5f] to-[#2563eb] text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? "..." : c.submit}
                  {!submitting && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer lang={lang} />
    </div>
  );
}
