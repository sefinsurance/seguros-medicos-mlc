import React, { useState } from "react";
import { submitBrokerApplication } from "@/lib/publicIntakeApi";
import ContactBar from "@/components/home/ContactBar";
import Footer from "@/components/home/Footer";
import { CheckCircle2, DollarSign, Users, TrendingUp, Award, Phone, Mail, ChevronRight } from "lucide-react";

const commissionTiers = [
  { tier: "Associate", volume: "$0 – $25K AV", rate: "Competitive base commission", perks: "Access to carrier portfolio, onboarding support" },
  { tier: "Silver Partner", volume: "$25K – $75K AV", rate: "Enhanced commission + bonuses", perks: "Priority support, co-marketing materials" },
  { tier: "Gold Partner", volume: "$75K – $150K AV", rate: "Top-tier commission + overrides", perks: "Dedicated account manager, exclusive leads" },
  { tier: "Platinum Partner", volume: "$150K+ AV", rate: "Maximum commissions + profit sharing", perks: "VIP events, agency building opportunities" },
];

const benefits = [
  { icon: DollarSign, title: "Industry-Leading Commissions", desc: "Unleash your full potential. Full commission and bonuses available across ACA, Medicare, Life, and Dental plans." },
  { icon: TrendingUp, title: "Uncapped Earning Potential", desc: "No ceiling on your income. The more you grow, the more you earn with bonus tiers." },
  { icon: Users, title: "Full Back-Office Support", desc: "We handle quoting, enrollment, and compliance so you focus on selling." },
  { icon: Award, title: "Multi-Carrier Access", desc: "Represent top carriers in the market with a broad portfolio for every client need." },
];

export default function ForBrokers() {
  const [lang, setLang] = useState("en");
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", state: "", years_experience: "", license_types: "", carriers: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = "Required";
    if (!form.email.trim()) e.email = "Required";
    if (!form.phone.trim()) e.phone = "Required";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitting(true);
    await submitBrokerApplication(form);
    setSubmitted(true);
    setSubmitting(false);
  };

  const field = (key, label, type = "text", required = false) => (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => { setForm(f => ({ ...f, [key]: e.target.value })); setErrors(er => ({ ...er, [key]: undefined })); }}
        className={`border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 ${errors[key] ? "border-red-400" : "border-gray-300"}`}
      />
      {errors[key] && <span className="text-xs text-red-500">{errors[key]}</span>}
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #ebf5ff 0%, #dae8f6 50%, #d4e3f4 100%)" }}>
      <ContactBar lang={lang} setLang={setLang} />

      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
            Partner With Us
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#1e3a5f] leading-tight mb-5">
            Grow Your Book of Business<br className="hidden md:block" /> With MLC Insurance
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto mb-8">
            Join a network of top-performing brokers across Florida, Texas, and beyond. We provide the tools, carriers, and support you need to build a thriving insurance practice.
          </p>
          <a href="#apply" className="inline-flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#163059] text-white font-bold px-8 py-3.5 rounded-xl transition-colors shadow-lg">
            Apply to Join <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-extrabold text-[#1e3a5f] text-center mb-10">Why Partner With MLC Insurance?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow border border-gray-100 flex flex-col gap-3 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <b.icon className="w-5 h-5 text-[#1e3a5f]" />
                </div>
                <h3 className="font-bold text-[#1e3a5f] text-sm">{b.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commission Tiers */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-extrabold text-[#1e3a5f] text-center mb-3">Commission Structure</h2>
          <p className="text-slate-500 text-sm text-center mb-10">Transparent tiers that reward your production. The more you write, the more you earn.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {commissionTiers.map((t, i) => (
              <div key={i} className={`rounded-2xl border p-6 flex flex-col gap-3 ${i === 3 ? "bg-[#1e3a5f] text-white border-[#1e3a5f]" : "bg-gray-50 border-gray-200"}`}>
                <div className={`text-xs font-bold uppercase tracking-widest ${i === 3 ? "text-blue-300" : "text-blue-600"}`}>{t.tier}</div>
                <div className={`font-bold text-sm ${i === 3 ? "text-white" : "text-[#1e3a5f]"}`}>{t.volume}</div>
                <div className={`text-sm font-semibold ${i === 3 ? "text-green-300" : "text-green-600"}`}>{t.rate}</div>
                <div className={`text-xs leading-relaxed ${i === 3 ? "text-blue-200" : "text-gray-500"}`}>{t.perks}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-center mt-6">* AV = Annual Volume. Exact commission rates shared upon approval. Tiers subject to carrier guidelines.</p>
        </div>
      </section>

      {/* What We Offer List */}
      <section className="py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold text-[#1e3a5f] text-center mb-8">What You Get as an MLC Partner</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              "Access to 20+ top insurance carriers",
              "ACA, Medicare, Life & Dental product lines",
              "Agent training & certification support",
              "Co-branded marketing materials",
              "CRM & lead management tools",
              "Dedicated broker support team",
              "Bilingual client service assistance",
              "Flexible – captive or independent",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="py-14 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-extrabold text-[#1e3a5f] text-center mb-2">Ready to Get Started?</h2>
          <p className="text-slate-500 text-sm text-center mb-8">Fill out the form below and a member of our broker team will reach out within 1 business day.</p>

          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-green-800 mb-2">Application Received!</h3>
              <p className="text-green-700 text-sm">Thank you for your interest in partnering with MLC Insurance. We'll be in touch within 1 business day.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl border border-gray-200 p-6 md:p-8 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {field("full_name", "Full Name", "text", true)}
                {field("email", "Email Address", "email", true)}
                {field("phone", "Phone Number", "tel", true)}
                {field("state", "State Licensed In", "text")}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Years of Experience</label>
                <select
                  value={form.years_experience}
                  onChange={e => setForm(f => ({ ...f, years_experience: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Select...</option>
                  {["Less than 1 year", "1–3 years", "3–5 years", "5–10 years", "10+ years"].map(o => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>

              {field("license_types", "License Types Held (e.g. Health, Life, P&C)")}
              {field("carriers", "Current or Previous Carriers")}

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Additional Message</label>
                <textarea
                  rows={3}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  placeholder="Tell us about yourself or any questions you have..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#1e3a5f] hover:bg-[#163059] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 text-sm text-slate-500">
            <a href="tel:8774582557" className="flex items-center gap-2 hover:text-[#1e3a5f] transition-colors">
              <Phone className="w-4 h-4" /> 877-458-2557
            </a>
            <a href="mailto:info@mlcinsuranceagency.com" className="flex items-center gap-2 hover:text-[#1e3a5f] transition-colors">
              <Mail className="w-4 h-4" /> info@mlcinsuranceagency.com
            </a>
          </div>
        </div>
      </section>

      <Footer lang={lang} />
    </div>
  );
}